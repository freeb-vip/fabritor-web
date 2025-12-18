const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// 贴图存储目录
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/stickers';
const META_FILE = path.join(UPLOAD_DIR, 'stickers.json');

// 确保目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 初始化元数据文件
if (!fs.existsSync(META_FILE)) {
  fs.writeFileSync(META_FILE, JSON.stringify({ stickers: [] }, null, 2));
}

// 读取元数据
function getStickers() {
  try {
    const data = fs.readFileSync(META_FILE, 'utf8');
    return JSON.parse(data).stickers || [];
  } catch (e) {
    return [];
  }
}

// 保存元数据
function saveStickers(stickers) {
  fs.writeFileSync(META_FILE, JSON.stringify({ stickers }, null, 2));
}

// 配置 CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 静态文件服务 - 提供上传的贴图
app.use('/uploads', express.static(UPLOAD_DIR));

// 配置 multer 上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const id = uuidv4();
    cb(null, `${id}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 获取贴图列表
app.get('/api/stickers', (req, res) => {
  try {
    const stickers = getStickers();
    res.json({ success: true, stickers });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 上传贴图
app.post('/api/stickers', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请上传文件' });
    }

    const stickers = getStickers();
    const newSticker = {
      id: path.basename(req.file.filename, path.extname(req.file.filename)),
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date().toISOString(),
      uploader: req.body.uploader || '匿名'
    };

    stickers.unshift(newSticker);
    saveStickers(stickers);

    res.json({ success: true, sticker: newSticker });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 删除贴图
app.delete('/api/stickers/:id', (req, res) => {
  try {
    const { id } = req.params;
    let stickers = getStickers();
    const sticker = stickers.find(s => s.id === id);
    
    if (!sticker) {
      return res.status(404).json({ success: false, error: '贴图不存在' });
    }

    // 删除文件
    const filePath = path.join(UPLOAD_DIR, sticker.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 更新元数据
    stickers = stickers.filter(s => s.id !== id);
    saveStickers(stickers);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sticker server running on port ${PORT}`);
  console.log(`Upload directory: ${UPLOAD_DIR}`);
});
