import { useContext, useState, useEffect, useRef } from 'react';
import { Card, Row, Col, message, Divider, Typography, Upload, Button, Spin, Popconfirm, Empty } from 'antd';
import { UploadOutlined, DeleteOutlined, ReloadOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { GlobalStateContext } from '@/context';
import { useTranslation } from '@/i18n/utils';
import { createImage } from '@/editor/objects/image';

const { Title } = Typography;

// 电商常用贴图 - 纯符号/emoji，不含文字
const ECOMMERCE_STICKERS = [
  { key: 'star', emoji: '⭐', label: 'Star' },
  { key: 'fire', emoji: '🔥', label: 'Hot' },
  { key: 'lightning', emoji: '⚡', label: 'Flash' },
  { key: 'sparkles', emoji: '✨', label: 'Sparkles' },
  { key: 'heart', emoji: '❤️', label: 'Heart' },
  { key: 'thumbsup', emoji: '👍', label: 'Thumbs Up' },
  { key: 'crown', emoji: '👑', label: 'Crown' },
  { key: 'trophy', emoji: '🏆', label: 'Trophy' },
  { key: 'medal', emoji: '🥇', label: 'Medal' },
  { key: 'diamond', emoji: '💎', label: 'Diamond' },
  { key: 'cart', emoji: '🛒', label: 'Cart' },
  { key: 'gift', emoji: '🎁', label: 'Gift' },
  { key: 'package', emoji: '📦', label: 'Package' },
  { key: 'tag', emoji: '🏷️', label: 'Tag' },
  { key: 'money', emoji: '💰', label: 'Money' },
  { key: 'moneybag', emoji: '💵', label: 'Cash' },
  { key: 'coin', emoji: '🪙', label: 'Coin' },
  { key: 'percent', emoji: '💯', label: 'Percent' },
  { key: 'peso', emoji: '₱', label: 'PHP Peso' },
  { key: 'baht', emoji: '฿', label: 'THB Baht' },
  { key: 'arrowRight', emoji: '➡️', label: 'Arrow' },
  { key: 'pointRight', emoji: '👉', label: 'Point' },
  { key: 'check', emoji: '✅', label: 'Check' },
  { key: 'cross', emoji: '❌', label: 'Cross' },
  { key: 'exclamation', emoji: '❗', label: 'Important' },
  { key: 'bell', emoji: '🔔', label: 'Bell' },
  { key: 'megaphone', emoji: '📢', label: 'Announce' },
  { key: 'confetti', emoji: '🎉', label: 'Confetti' },
  { key: 'ribbon', emoji: '🎀', label: 'Ribbon' },
  { key: 'flower', emoji: '🌸', label: 'Flower' },
  { key: 'clock', emoji: '⏰', label: 'Clock' },
  { key: 'hourglass', emoji: '⏳', label: 'Hourglass' },
  { key: 'muscle', emoji: '💪', label: 'Strong' },
  { key: 'rocket', emoji: '🚀', label: 'Rocket' },
];

// 促销素材：按要求不包含任何数字/文字，保留为纯形状/图形

// 颜色配置
const COLOR_SCHEMES: Record<string, { start: string; end: string; stroke: string }> = {
  red: { start: '#ff6b6b', end: '#ee5a5a', stroke: '#cc4444' },
  yellow: { start: '#ffd93d', end: '#f5c400', stroke: '#d4a800' },
  orange: { start: '#ff9f43', end: '#ee8c2c', stroke: '#cc7520' },
  green: { start: '#26de81', end: '#20bf6b', stroke: '#1a9956' },
  blue: { start: '#45aaf2', end: '#2d98da', stroke: '#2180b9' },
  purple: { start: '#a55eea', end: '#8854d0', stroke: '#7044b0' },
};

// 创建带颜色背景的货币符号SVG
function createColoredSymbolSvg(symbol: string, color: string = 'red'): string {
  const size = 60;
  const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.red;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="symGrad${symbol.charCodeAt(0)}${color}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${scheme.start};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${scheme.end};stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="url(#symGrad${symbol.charCodeAt(0)}${color})" stroke="${scheme.stroke}" stroke-width="2"/>
    <text x="50%" y="55%" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${symbol}</text>
  </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// 带颜色的货币符号
const COLORED_CURRENCY_SYMBOLS = [
  { key: 'pesoRed', svg: createColoredSymbolSvg('₱', 'red'), label: '₱红' },
  { key: 'pesoYellow', svg: createColoredSymbolSvg('₱', 'yellow'), label: '₱黄' },
  { key: 'pesoOrange', svg: createColoredSymbolSvg('₱', 'orange'), label: '₱橙' },
  { key: 'pesoGreen', svg: createColoredSymbolSvg('₱', 'green'), label: '₱绿' },
  { key: 'bahtRed', svg: createColoredSymbolSvg('฿', 'red'), label: '฿红' },
  { key: 'bahtYellow', svg: createColoredSymbolSvg('฿', 'yellow'), label: '฿黄' },
  { key: 'bahtOrange', svg: createColoredSymbolSvg('฿', 'orange'), label: '฿橙' },
  { key: 'bahtGreen', svg: createColoredSymbolSvg('฿', 'green'), label: '฿绿' },
];

// 创建优惠券SVG
function createCouponSvg(color: string = 'red'): string {
  const width = 120;
  const height = 60;
  const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.red;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="grad${color}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${scheme.start};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${scheme.end};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="${width-4}" height="${height-4}" rx="10" ry="10" fill="url(#grad${color})" stroke="${scheme.stroke}" stroke-width="2"/>
    <circle cx="0" cy="${height/2}" r="8" fill="white"/>
    <circle cx="${width}" cy="${height/2}" r="8" fill="white"/>
    <line x1="${width*0.65}" y1="10" x2="${width*0.65}" y2="${height-10}" stroke="white" stroke-width="2" stroke-dasharray="5,5"/>
    <!-- no text/number by design -->
  </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// 优惠券SVG形状 - 不含文字/数字
const COUPON_SHAPES = [
  // 红 / 黄 / 绿 / 橙 四种促销色
  { key: 'couponRed', svg: createCouponSvg('red'), label: 'coupon-red' },
  { key: 'couponYellow', svg: createCouponSvg('yellow'), label: 'coupon-yellow' },
  { key: 'couponGreen', svg: createCouponSvg('green'), label: 'coupon-green' },
  { key: 'couponOrange', svg: createCouponSvg('orange'), label: 'coupon-orange' },
];

// 贴图服务API地址 - 生产环境使用相对路径，开发时可配置
const STICKER_API_BASE = 'http://localhost:3002';

// 共享贴图接口类型
interface SharedSticker {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  uploadedAt: string;
  uploader: string;
}

// 将 emoji 转换为 SVG 图片 URL
const emojiToSvgDataUrl = (emoji: string, size = 200): string => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="' + (size * 0.8) + '">' + emoji + '</text></svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
};

export default function StickerPanel() {
  const { editor } = useContext(GlobalStateContext);
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 共享贴图状态
  const [sharedStickers, setSharedStickers] = useState<SharedSticker[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 加载共享贴图列表
  const fetchSharedStickers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${STICKER_API_BASE}/api/stickers`);
      const data = await res.json();
      if (data.success) {
        setSharedStickers(data.stickers || []);
      }
    } catch (e) {
      console.error('加载共享贴图失败:', e);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchSharedStickers();
  }, []);

  // 上传贴图
  const handleUpload = async (file: File) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploader', '团队成员');

      const res = await fetch(`${STICKER_API_BASE}/api/stickers`, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        message.success(t('panel.sticker.upload_success') || '上传成功');
        fetchSharedStickers();
      } else {
        message.error(data.error || '上传失败');
      }
    } catch (e) {
      console.error('上传失败:', e);
      message.error(t('panel.sticker.upload_failed') || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 删除贴图
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${STICKER_API_BASE}/api/stickers/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        message.success(t('panel.sticker.delete_success') || '删除成功');
        fetchSharedStickers();
      } else {
        message.error(data.error || '删除失败');
      }
    } catch (e) {
      console.error('删除失败:', e);
      message.error(t('panel.sticker.delete_failed') || '删除失败');
    }
  };

  // 添加共享贴图到画布
  const handleSharedStickerClick = async (sticker: SharedSticker) => {
    if (!editor?.canvas) {
      message.warning(t('panel.sticker.no_canvas') || '请先打开画布');
      return;
    }
    try {
      const imageUrl = `${STICKER_API_BASE}${sticker.url}`;
      await createImage({
        imageSource: imageUrl,
        canvas: editor.canvas,
      });
    } catch (e) {
      console.error('添加贴图失败:', e);
      message.error(t('panel.sticker.add_failed') || '添加失败');
    }
  };

  const handleStickerClick = async (emoji: string) => {
    if (!editor?.canvas) {
      message.warning(t('panel.sticker.no_canvas') || '请先打开画布');
      return;
    }
    try {
      const svgUrl = emojiToSvgDataUrl(emoji, 200);
      await createImage({
        imageSource: svgUrl,
        canvas: editor.canvas,
      });
    } catch (e) {
      console.error('添加贴图失败:', e);
      message.error(t('panel.sticker.add_failed') || '添加失败');
    }
  };

  const handleCouponClick = async (svgUrl: string) => {
    if (!editor?.canvas) {
      message.warning(t('panel.sticker.no_canvas') || '请先打开画布');
      return;
    }
    try {
      await createImage({
        imageSource: svgUrl,
        canvas: editor.canvas,
      });
    } catch (e) {
      console.error('添加素材失败:', e);
      message.error(t('panel.sticker.add_failed') || '添加失败');
    }
  };

  // 文件选择处理
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div style={{ padding: '16px 16px 16px 0' }}>
      {/* 共享贴图区域 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Title level={5} style={{ margin: 0 }}>{t('panel.sticker.shared') || '共享贴图'}</Title>
        <div>
          <Button 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={fetchSharedStickers}
            loading={loading}
            style={{ marginRight: 8 }}
          />
          <Button 
            size="small" 
            type="primary"
            icon={<CloudUploadOutlined />} 
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
          >
            {t('panel.sticker.upload') || '上传'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFileSelect}
          />
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : sharedStickers.length === 0 ? (
        <Empty 
          description={t('panel.sticker.no_shared') || '暂无共享贴图'} 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: '16px 0' }}
        />
      ) : (
        <Row gutter={[8, 8]}>
          {sharedStickers.map((sticker) => (
            <Col span={8} key={sticker.id}>
              <Card
                hoverable
                size="small"
                style={{ textAlign: 'center', cursor: 'pointer', padding: 0, position: 'relative' }}
                bodyStyle={{ padding: '4px' }}
                onClick={() => handleSharedStickerClick(sticker)}
              >
                <img 
                  src={`${STICKER_API_BASE}${sticker.url}`} 
                  alt={sticker.originalName} 
                  style={{ width: '100%', height: 50, objectFit: 'contain' }} 
                />
                <Popconfirm
                  title={t('panel.sticker.delete_confirm') || '确认删除?'}
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDelete(sticker.id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                >
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    style={{ 
                      position: 'absolute', 
                      top: 2, 
                      right: 2,
                      padding: 0,
                      width: 20,
                      height: 20,
                      minWidth: 20,
                      fontSize: 12
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Divider style={{ margin: '16px 0' }} />

      <Title level={5} style={{ marginBottom: 12 }}>{t('panel.sticker.promo_shapes') || '促销素材'}</Title>
      <Row gutter={[8, 8]}>
        {COUPON_SHAPES.map((item) => (
          <Col span={12} key={item.key}>
            <Card
              hoverable
              size="small"
              style={{ textAlign: 'center', cursor: 'pointer', padding: 0 }}
              bodyStyle={{ padding: '8px 4px' }}
              onClick={() => handleCouponClick(item.svg)}
            >
              <img src={item.svg} alt={item.label} style={{ width: '100%', height: 40, objectFit: 'contain' }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Divider style={{ margin: '16px 0' }} />

      <Title level={5} style={{ marginBottom: 12 }}>{t('panel.sticker.currency_symbols') || '货币符号'}</Title>
      <Row gutter={[8, 8]}>
        {COLORED_CURRENCY_SYMBOLS.map((item) => (
          <Col span={6} key={item.key}>
            <Card
              hoverable
              size="small"
              style={{ textAlign: 'center', cursor: 'pointer', padding: 0 }}
              bodyStyle={{ padding: '4px 0' }}
              onClick={() => handleCouponClick(item.svg)}
            >
              <img src={item.svg} alt={item.label} style={{ width: 40, height: 40, objectFit: 'contain' }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Divider style={{ margin: '16px 0' }} />

      <Title level={5} style={{ marginBottom: 12 }}>{t('panel.sticker.ecommerce') || '电商贴图'}</Title>
      <Row gutter={[8, 8]}>
        {ECOMMERCE_STICKERS.map((sticker) => (
          <Col span={6} key={sticker.key}>
            <Card
              hoverable
              size="small"
              style={{ textAlign: 'center', cursor: 'pointer', padding: 0 }}
              bodyStyle={{ padding: '6px 0' }}
              onClick={() => handleStickerClick(sticker.emoji)}
            >
              <span style={{ fontSize: 24 }}>{sticker.emoji}</span>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
