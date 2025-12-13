# Fabritor Web - Kubernetes 部署指南

本指南介绍如何使用 Kubernetes 原生 YAML 文件或 Helm Chart 部署 Fabritor Web 应用。

## 目录

- [前提条件](#前提条件)
- [方法一：使用 Helm 部署（推荐）](#方法一使用-helm-部署推荐)
- [方法二：使用 Kubernetes YAML 部署](#方法二使用-kubernetes-yaml-部署)
- [配置说明](#配置说明)
- [访问应用](#访问应用)
- [监控和日志](#监控和日志)
- [故障排查](#故障排查)

## 前提条件

1. **Kubernetes 集群**
   - Kubernetes 版本 >= 1.19
   - 可以使用 Minikube、Kind、K3s 或云提供商的 Kubernetes 服务

2. **kubectl**
   ```bash
   kubectl version --client
   ```

3. **Helm（使用 Helm 部署时需要）**
   ```bash
   helm version
   # 如果未安装，可以通过以下命令安装
   curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   ```

4. **Docker 镜像**
   ```bash
   # 构建镜像
   docker build -t fabritor-web:latest .
   
   # 如果使用私有仓库，需要推送镜像
   docker tag fabritor-web:latest your-registry.com/fabritor-web:latest
   docker push your-registry.com/fabritor-web:latest
   ```

## 方法一：使用 Helm 部署（推荐）

### 1. 安装应用

#### 基础安装

```bash
# 进入项目目录
cd /path/to/fabritor-web

# 使用默认配置安装
helm install fabritor-web ./helm/fabritor-web

# 或指定命名空间
helm install fabritor-web ./helm/fabritor-web -n production --create-namespace
```

#### 自定义配置安装

```bash
# 创建自定义配置文件
cat > custom-values.yaml <<EOF
replicaCount: 3

image:
  repository: your-registry.com/fabritor-web
  tag: "1.0.0"
  pullPolicy: Always

imagePullSecrets:
  - name: registry-secret

ingress:
  enabled: true
  className: nginx
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
EOF

# 使用自定义配置安装
helm install fabritor-web ./helm/fabritor-web -f custom-values.yaml -n production
```

### 2. 升级应用

```bash
# 升级应用
helm upgrade fabritor-web ./helm/fabritor-web -f custom-values.yaml -n production

# 升级并等待所有 Pod 就绪
helm upgrade fabritor-web ./helm/fabritor-web -f custom-values.yaml -n production --wait

# 升级时设置镜像版本
helm upgrade fabritor-web ./helm/fabritor-web \
  --set image.tag=1.1.0 \
  -n production
```

### 3. 查看部署状态

```bash
# 查看 Helm Release 状态
helm status fabritor-web -n production

# 查看部署的资源
helm get manifest fabritor-web -n production

# 查看 Pod 状态
kubectl get pods -n production -l app.kubernetes.io/name=fabritor-web

# 查看服务
kubectl get svc -n production -l app.kubernetes.io/name=fabritor-web

# 查看 Ingress
kubectl get ingress -n production
```

### 4. 卸载应用

```bash
# 卸载应用
helm uninstall fabritor-web -n production

# 删除命名空间（如果需要）
kubectl delete namespace production
```

### 5. 回滚版本

```bash
# 查看历史版本
helm history fabritor-web -n production

# 回滚到上一个版本
helm rollback fabritor-web -n production

# 回滚到指定版本
helm rollback fabritor-web 2 -n production
```

## 方法二：使用 Kubernetes YAML 部署

### 1. 部署应用

```bash
# 创建命名空间
kubectl create namespace fabritor-web

# 应用所有配置
kubectl apply -f k8s/ -n fabritor-web

# 或者逐个应用
kubectl apply -f k8s/deployment.yaml -n fabritor-web
kubectl apply -f k8s/service.yaml -n fabritor-web
kubectl apply -f k8s/ingress.yaml -n fabritor-web
kubectl apply -f k8s/hpa.yaml -n fabritor-web
kubectl apply -f k8s/pdb.yaml -n fabritor-web
```

### 2. 修改配置

修改 `k8s/` 目录下的 YAML 文件，然后重新应用：

```bash
# 修改副本数
kubectl scale deployment fabritor-web --replicas=5 -n fabritor-web

# 更新镜像
kubectl set image deployment/fabritor-web \
  fabritor-web=your-registry.com/fabritor-web:1.1.0 \
  -n fabritor-web

# 应用修改后的配置
kubectl apply -f k8s/deployment.yaml -n fabritor-web
```

### 3. 查看状态

```bash
# 查看所有资源
kubectl get all -n fabritor-web

# 查看 Pod 详情
kubectl describe pod <pod-name> -n fabritor-web

# 查看日志
kubectl logs -f deployment/fabritor-web -n fabritor-web

# 查看事件
kubectl get events -n fabritor-web --sort-by='.lastTimestamp'
```

### 4. 删除应用

```bash
# 删除所有资源
kubectl delete -f k8s/ -n fabritor-web

# 删除命名空间
kubectl delete namespace fabritor-web
```

## 配置说明

### Helm Values 配置项

| 参数 | 描述 | 默认值 |
|------|------|--------|
| `replicaCount` | Pod 副本数 | `2` |
| `image.repository` | 镜像仓库 | `fabritor-web` |
| `image.tag` | 镜像标签 | `latest` |
| `image.pullPolicy` | 镜像拉取策略 | `IfNotPresent` |
| `service.type` | Service 类型 | `ClusterIP` |
| `service.port` | Service 端口 | `80` |
| `ingress.enabled` | 是否启用 Ingress | `true` |
| `ingress.className` | Ingress Class 名称 | `nginx` |
| `ingress.hosts` | Ingress 主机配置 | `fabritor.example.com` |
| `resources.limits.cpu` | CPU 限制 | `500m` |
| `resources.limits.memory` | 内存限制 | `512Mi` |
| `resources.requests.cpu` | CPU 请求 | `100m` |
| `resources.requests.memory` | 内存请求 | `128Mi` |
| `autoscaling.enabled` | 是否启用自动扩缩容 | `true` |
| `autoscaling.minReplicas` | 最小副本数 | `2` |
| `autoscaling.maxReplicas` | 最大副本数 | `10` |

### 私有镜像仓库配置

如果使用私有镜像仓库，需要创建 Secret：

```bash
# 创建 Docker Registry Secret
kubectl create secret docker-registry registry-secret \
  --docker-server=your-registry.com \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email@example.com \
  -n production

# 在 values.yaml 中引用
imagePullSecrets:
  - name: registry-secret
```

### SSL/TLS 证书配置

#### 使用 cert-manager（推荐）

```bash
# 安装 cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# 创建 ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

#### 使用自签名证书

```bash
# 创建自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=fabritor.example.com"

# 创建 Secret
kubectl create secret tls fabritor-web-tls \
  --cert=tls.crt \
  --key=tls.key \
  -n production
```

## 访问应用

### 通过 Ingress 访问

配置 DNS 或修改 hosts 文件：

```bash
# 获取 Ingress 地址
kubectl get ingress -n production

# 添加到 /etc/hosts（本地测试）
echo "INGRESS_IP fabritor.yourdomain.com" | sudo tee -a /etc/hosts
```

### 通过 Port Forward 访问

```bash
# 端口转发到本地
kubectl port-forward -n production svc/fabritor-web 8080:80

# 访问 http://localhost:8080
```

### 通过 LoadBalancer 访问

如果使用云提供商的 LoadBalancer：

```bash
# 修改 Service 类型
kubectl patch svc fabritor-web -n production -p '{"spec": {"type": "LoadBalancer"}}'

# 获取外部 IP
kubectl get svc fabritor-web -n production -w
```

## 监控和日志

### 查看应用日志

```bash
# 查看所有 Pod 日志
kubectl logs -f deployment/fabritor-web -n production

# 查看特定 Pod 日志
kubectl logs -f <pod-name> -n production

# 查看最近 1 小时的日志
kubectl logs --since=1h deployment/fabritor-web -n production

# 查看错误日志
kubectl logs deployment/fabritor-web -n production | grep -i error
```

### 监控资源使用

```bash
# 查看 Pod 资源使用情况
kubectl top pods -n production

# 查看 Node 资源使用情况
kubectl top nodes

# 查看 HPA 状态
kubectl get hpa -n production
```

### 集成 Prometheus 和 Grafana

```bash
# 使用 Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace
```

## 故障排查

### Pod 无法启动

```bash
# 查看 Pod 状态
kubectl get pods -n production

# 查看 Pod 详情
kubectl describe pod <pod-name> -n production

# 查看 Pod 日志
kubectl logs <pod-name> -n production

# 查看上一次容器日志（如果容器重启过）
kubectl logs <pod-name> -n production --previous
```

### 镜像拉取失败

```bash
# 检查 imagePullSecrets 配置
kubectl get secret -n production

# 验证 Secret 内容
kubectl get secret registry-secret -n production -o yaml

# 手动拉取镜像测试
docker pull your-registry.com/fabritor-web:latest
```

### Ingress 无法访问

```bash
# 检查 Ingress 配置
kubectl describe ingress -n production

# 检查 Ingress Controller
kubectl get pods -n ingress-nginx

# 查看 Ingress Controller 日志
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

### HPA 不工作

```bash
# 检查 Metrics Server
kubectl get deployment metrics-server -n kube-system

# 如果未安装 Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 查看 HPA 详情
kubectl describe hpa fabritor-web -n production
```

### 性能问题

```bash
# 增加资源限制
kubectl set resources deployment fabritor-web \
  --limits=cpu=1000m,memory=1Gi \
  --requests=cpu=200m,memory=256Mi \
  -n production

# 增加副本数
kubectl scale deployment fabritor-web --replicas=5 -n production

# 调整 HPA 参数
kubectl autoscale deployment fabritor-web \
  --min=3 --max=20 --cpu-percent=70 \
  -n production
```

## 生产环境最佳实践

### 1. 资源限制

始终为 Pod 设置资源请求和限制：

```yaml
resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 200m
    memory: 256Mi
```

### 2. 健康检查

配置 liveness 和 readiness 探针：

```yaml
livenessProbe:
  httpGet:
    path: /
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /
    port: http
  initialDelaySeconds: 10
  periodSeconds: 5
```

### 3. 高可用性

- 设置多个副本（至少 2 个）
- 配置 Pod 反亲和性
- 启用 Pod Disruption Budget
- 使用 HPA 自动扩缩容

### 4. 安全性

- 使用非 root 用户运行容器
- 启用网络策略
- 定期更新镜像
- 扫描镜像漏洞

### 5. 备份和恢复

```bash
# 备份 Helm Release
helm get values fabritor-web -n production > backup-values.yaml

# 备份 Kubernetes 资源
kubectl get all -n production -o yaml > backup-resources.yaml

# 恢复
helm install fabritor-web ./helm/fabritor-web -f backup-values.yaml -n production
```

## 参考资源

- [Kubernetes 官方文档](https://kubernetes.io/docs/)
- [Helm 官方文档](https://helm.sh/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager 文档](https://cert-manager.io/docs/)

## 技术支持

如有问题，请访问：
- GitHub Issues: https://github.com/freeb-vip/fabritor-web/issues
- 项目主页: https://github.com/freeb-vip/fabritor-web
