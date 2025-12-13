# Kubernetes 快速部署示例

## Minikube 本地测试

### 1. 启动 Minikube

```bash
# 启动 Minikube
minikube start --cpus=4 --memory=8192

# 启用 Ingress 插件
minikube addons enable ingress

# 启用 Metrics Server（用于 HPA）
minikube addons enable metrics-server
```

### 2. 构建镜像到 Minikube

```bash
# 使用 Minikube 的 Docker 环境
eval $(minikube docker-env)

# 构建镜像
docker build -t fabritor-web:latest .
```

### 3. 使用 Helm 部署

```bash
# 创建自定义配置（禁用 TLS，使用 NodePort）
cat > minikube-values.yaml <<EOF
replicaCount: 1

image:
  repository: fabritor-web
  tag: latest
  pullPolicy: Never  # 使用本地镜像

service:
  type: NodePort

ingress:
  enabled: true
  className: nginx
  annotations: {}
  hosts:
    - host: fabritor.local
      paths:
        - path: /
          pathType: Prefix
  tls: []  # 禁用 TLS

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: false
EOF

# 部署
helm install fabritor-web ./helm/fabritor-web -f minikube-values.yaml

# 查看状态
kubectl get all

# 获取访问地址
minikube service fabritor-web --url
```

### 4. 配置 Hosts

```bash
# 获取 Minikube IP
echo "$(minikube ip) fabritor.local" | sudo tee -a /etc/hosts

# 访问应用
open http://fabritor.local  # macOS
xdg-open http://fabritor.local  # Linux
```

## Kind 本地测试

### 1. 创建 Kind 集群

```bash
# 创建配置文件
cat > kind-config.yaml <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF

# 创建集群
kind create cluster --config kind-config.yaml --name fabritor
```

### 2. 安装 NGINX Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# 等待 Ingress Controller 就绪
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### 3. 加载镜像到 Kind

```bash
# 构建镜像
docker build -t fabritor-web:latest .

# 加载到 Kind
kind load docker-image fabritor-web:latest --name fabritor
```

### 4. 部署应用

```bash
# 使用 Helm 部署
cat > kind-values.yaml <<EOF
replicaCount: 1

image:
  repository: fabritor-web
  tag: latest
  pullPolicy: Never

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: fabritor.local
      paths:
        - path: /
          pathType: Prefix
  tls: []

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: false
EOF

helm install fabritor-web ./helm/fabritor-web -f kind-values.yaml

# 配置 hosts
echo "127.0.0.1 fabritor.local" | sudo tee -a /etc/hosts

# 访问 http://fabritor.local
```

## 生产环境示例（阿里云 ACK）

### 1. 推送镜像到阿里云容器镜像服务

```bash
# 登录阿里云镜像仓库
docker login --username=your-username registry.cn-hangzhou.aliyuncs.com

# 标记镜像
docker tag fabritor-web:latest \
  registry.cn-hangzhou.aliyuncs.com/your-namespace/fabritor-web:1.0.0

# 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/fabritor-web:1.0.0
```

### 2. 创建 ImagePullSecret

```bash
kubectl create secret docker-registry aliyun-registry \
  --docker-server=registry.cn-hangzhou.aliyuncs.com \
  --docker-username=your-username \
  --docker-password=your-password \
  -n production
```

### 3. 部署配置

```bash
cat > production-values.yaml <<EOF
replicaCount: 3

image:
  repository: registry.cn-hangzhou.aliyuncs.com/your-namespace/fabritor-web
  tag: "1.0.0"
  pullPolicy: Always

imagePullSecrets:
  - name: aliyun-registry

service:
  type: ClusterIP

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: fabritor.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: fabritor-web-tls
      hosts:
        - fabritor.yourdomain.com

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 200m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 75

podDisruptionBudget:
  enabled: true
  minAvailable: 2

affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
            - key: app.kubernetes.io/name
              operator: In
              values:
                - fabritor-web
        topologyKey: kubernetes.io/hostname
EOF

# 部署
helm install fabritor-web ./helm/fabritor-web \
  -f production-values.yaml \
  -n production --create-namespace
```

## 使用 kubectl 直接部署（不使用 Helm）

### 1. 修改配置

```bash
# 编辑 k8s/deployment.yaml，修改镜像地址
sed -i 's|image: fabritor-web:latest|image: your-registry.com/fabritor-web:1.0.0|' k8s/deployment.yaml

# 编辑 k8s/ingress.yaml，修改域名
sed -i 's|fabritor.example.com|fabritor.yourdomain.com|g' k8s/ingress.yaml
```

### 2. 部署

```bash
# 创建命名空间
kubectl create namespace production

# 部署所有资源
kubectl apply -f k8s/ -n production

# 查看状态
kubectl get all -n production
```

## 监控部署

### 安装 Prometheus 和 Grafana

```bash
# 添加 Prometheus Helm 仓库
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 安装 kube-prometheus-stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace

# 访问 Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# 默认用户名: admin
# 默认密码: prom-operator
```

### 配置 ServiceMonitor（可选）

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: fabritor-web-metrics
  namespace: production
  labels:
    app: fabritor-web
spec:
  ports:
  - name: metrics
    port: 9090
    targetPort: 9090
  selector:
    app: fabritor-web
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: fabritor-web
  namespace: production
spec:
  selector:
    matchLabels:
      app: fabritor-web
  endpoints:
  - port: metrics
    interval: 30s
EOF
```

## 清理资源

```bash
# 使用 Helm 清理
helm uninstall fabritor-web -n production

# 使用 kubectl 清理
kubectl delete -f k8s/ -n production
kubectl delete namespace production

# 清理 Minikube
minikube delete

# 清理 Kind
kind delete cluster --name fabritor
```
