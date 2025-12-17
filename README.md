<p align="center"><img alt="logo" src="/public/logo.svg"></p>

<p align="center">
  <strong>👻 图片快速处理工具</strong><br/>
  <strong>😘 基于 Fabric.js 的图片编辑处理工具，支持多种尺寸预设、图层管理和模板保存</strong>
</p>

<p align="center"><img alt="banner" src="/public/fabritor_2024_1.png"></p>

### 🔥 文档

<strong>正在编写 [fabritor 手册](https://sleepy-zone.github.io/fabritor-handbook)，跟着 faritor 一起学习 fabric.js</strong>

手册内覆盖几乎所有的 fabritor 特性，也是一本 fabric.js 学习手册！

### 👻 特性

使用 fabritor，快速构建属于自己的图片编辑器。

在线体验：[https://fabritor.surge.sh/](https://fabritor.surge.sh/)

<p align="center"><img alt="banner" src="/public/fabritor_editor.png"></p>

**📚 文本** 内置多种开源字体；支持调整文字样式；支持多种文字特效：描边、阴影、形状文字、文字渐变、文字填充。

**🌄 图片** 加载本地或者远程图片；支持图片边框和圆角；支持图片裁剪；支持多种图片滤镜；

**➡️ 形状** 支持线段、箭头和多边形；多边形支持添加边框，同样支持渐变填充。支持手绘风格图形。

**✍️ 画笔** 支持自由绘制

**💎 应用** 二维码、emoji

**👚 画布** 支持定制背景色和画布尺寸；支持画布拖拽。

**🛒 元素操作** 锁定、透明度、组合、复制粘贴、删除、图层层级、历史操作记录、页面对齐及对应的快捷键操作。

**🛠 导出** 导出到剪贴板，导出 JPG、PNG、SVG 和模板（JSON），基于 JSON 可以构建模板库。

**📦 模板管理** 将设计保存为模板并存储在本地；支持模板预览、加载、删除；支持导出/导入模板文件。[详细说明](./TEMPLATE_GUIDE.md)

**安全可靠** 纯浏览器端操作；操作自动保存到本地，数据不丢失。

**多语言支持** 支持中英文切换

### 本地开发

```bash
npm install -g yarn
yarn
yarn start
```

访问: http://localhost:3000

### 使用 Docker 运行

项目已提供 Docker 配置，可以在容器中构建并用 nginx 提供静态文件。

构建并运行（使用 Docker）：

```bash
# 在项目根目录下构建镜像
docker build -t fabritor-web .

# 运行镜像并把容器 80 端口映射到宿主机 3000
docker run -d --rm -p 3000:80 --name fabritor-web fabritor-web

# 之后在浏览器打开 http://localhost:3000
```

或者使用 docker-compose（会自动构建并启动）：

```bash
docker compose build && docker compose up -d
# 停止并移除容器：
docker compose down
```

注意：构建镜像需要本地安装 Docker。构建阶段会使用 yarn，所以会读取仓库中的 `yarn.lock`。

### 使用 Kubernetes 部署

项目提供完整的 Kubernetes 和 Helm Chart 部署方案，支持生产环境高可用部署。

**特性：**
- ✅ Helm Chart 支持，简化部署和配置管理
- ✅ 自动扩缩容（HPA）
- ✅ 健康检查和就绪探针
- ✅ Ingress 支持（含 SSL/TLS）
- ✅ Pod 反亲和性和中断预算
- ✅ 资源限制和请求配置

**快速开始：**

```bash
# 使用 Helm 部署（推荐）
helm install fabritor-web ./helm/fabritor-web

# 或使用 kubectl 部署
kubectl apply -f k8s/

# 查看状态
kubectl get all
```

**详细文档：**
- [Kubernetes 部署指南](./K8S_DEPLOYMENT.md) - 完整的 K8s 部署文档
- [快速开始示例](./k8s/QUICKSTART.md) - Minikube、Kind 和生产环境示例

支持的环境：
- Minikube / Kind（本地开发测试）
- 阿里云 ACK
- 腾讯云 TKE
- AWS EKS
- Google GKE
- 任何标准 Kubernetes 集群

### 哪些项目在使用 fabritor

#### 截图美化工具

[https://www.photor.fun/](https://www.photor.fun/)

<p align="center"><img alt="photor" src="/public/photor.png"></p>

欢迎提交自己的作品或者项目。
