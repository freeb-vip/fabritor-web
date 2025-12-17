import { useContext } from 'react';
import { Card, Row, Col, message, Divider, Typography } from 'antd';
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

// 电商促销素材 - 优惠券/折扣形状，带数字
const PROMO_SHAPES = [
  { key: 'discount10', emoji: '🔟', label: '10' },
  { key: 'discount20', emoji: '2️⃣0️⃣', label: '20' },
  { key: 'discount30', emoji: '3️⃣0️⃣', label: '30' },
  { key: 'discount50', emoji: '5️⃣0️⃣', label: '50' },
  { key: 'num1', emoji: '①', label: '1' },
  { key: 'num2', emoji: '②', label: '2' },
  { key: 'num3', emoji: '③', label: '3' },
  { key: 'num4', emoji: '④', label: '4' },
  { key: 'num5', emoji: '⑤', label: '5' },
  { key: 'numCircle1', emoji: '❶', label: '1' },
  { key: 'numCircle2', emoji: '❷', label: '2' },
  { key: 'numCircle3', emoji: '❸', label: '3' },
  { key: 'peso', emoji: '₱', label: 'PHP' },
  { key: 'baht', emoji: '฿', label: 'THB' },
  { key: 'ticket', emoji: '🎫', label: 'Ticket' },
  { key: 'coupon', emoji: '🎟️', label: 'Coupon' },
  { key: 'bookmark', emoji: '🔖', label: 'Bookmark' },
  { key: 'label', emoji: '🏷️', label: 'Label' },
  { key: 'badge', emoji: '📛', label: 'Badge' },
  { key: 'certified', emoji: '✔️', label: 'Certified' },
  { key: 'star5', emoji: '★', label: 'Star' },
  { key: 'starOutline', emoji: '☆', label: 'Star Outline' },
];

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
function createCouponSvg(num: string, color: string = 'red'): string {
  const width = 120;
  const height = 60;
  const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.red;
  const fontSize = num.length > 3 ? 18 : 24;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="grad${num.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${scheme.start};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${scheme.end};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="${width-4}" height="${height-4}" rx="8" ry="8" fill="url(#grad${num.replace(/[^a-zA-Z0-9]/g, '')})" stroke="${scheme.stroke}" stroke-width="2"/>
    <circle cx="0" cy="${height/2}" r="8" fill="white"/>
    <circle cx="${width}" cy="${height/2}" r="8" fill="white"/>
    <line x1="${width*0.65}" y1="8" x2="${width*0.65}" y2="${height-8}" stroke="white" stroke-width="2" stroke-dasharray="4,4"/>
    <text x="${width*0.32}" y="${height*0.65}" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle">${num}</text>
  </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// 优惠券SVG形状 - 不含文字，可以显示数字
const COUPON_SHAPES = [
  // 红色系 - 人民币
  { key: 'coupon5', svg: createCouponSvg('5', 'red'), label: '5折券' },
  { key: 'coupon6', svg: createCouponSvg('6', 'red'), label: '6折券' },
  { key: 'coupon7', svg: createCouponSvg('7', 'red'), label: '7折券' },
  { key: 'coupon8', svg: createCouponSvg('8', 'red'), label: '8折券' },
  { key: 'coupon9', svg: createCouponSvg('9', 'red'), label: '9折券' },
  { key: 'coupon10', svg: createCouponSvg('10', 'red'), label: '10元券' },
  { key: 'coupon20', svg: createCouponSvg('20', 'red'), label: '20元券' },
  { key: 'coupon50', svg: createCouponSvg('50', 'red'), label: '50元券' },
  { key: 'coupon100', svg: createCouponSvg('100', 'red'), label: '100元券' },
  { key: 'coupon200', svg: createCouponSvg('200', 'red'), label: '200元券' },
  // 黄色/橙色系 - 菲律宾比索
  { key: 'couponPhp50', svg: createCouponSvg('₱50', 'yellow'), label: '₱50券' },
  { key: 'couponPhp100', svg: createCouponSvg('₱100', 'yellow'), label: '₱100券' },
  { key: 'couponPhp200', svg: createCouponSvg('₱200', 'yellow'), label: '₱200券' },
  { key: 'couponPhp500', svg: createCouponSvg('₱500', 'yellow'), label: '₱500券' },
  // 绿色系 - 泰铢
  { key: 'couponThb50', svg: createCouponSvg('฿50', 'green'), label: '฿50券' },
  { key: 'couponThb100', svg: createCouponSvg('฿100', 'green'), label: '฿100券' },
  { key: 'couponThb200', svg: createCouponSvg('฿200', 'green'), label: '฿200券' },
  { key: 'couponThb500', svg: createCouponSvg('฿500', 'green'), label: '฿500券' },
  // 橙色系 - 促销
  { key: 'couponOrange10', svg: createCouponSvg('10%', 'orange'), label: '10%OFF' },
  { key: 'couponOrange20', svg: createCouponSvg('20%', 'orange'), label: '20%OFF' },
  { key: 'couponOrange30', svg: createCouponSvg('30%', 'orange'), label: '30%OFF' },
  { key: 'couponOrange50', svg: createCouponSvg('50%', 'orange'), label: '50%OFF' },
];

// 将 emoji 转换为 SVG 图片 URL
const emojiToSvgDataUrl = (emoji: string, size = 200): string => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="' + (size * 0.8) + '">' + emoji + '</text></svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
};

export default function StickerPanel() {
  const { editor } = useContext(GlobalStateContext);
  const { t } = useTranslation();

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

  return (
    <div style={{ padding: '16px 16px 16px 0' }}>
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

      <Title level={5} style={{ marginBottom: 12 }}>{t('panel.sticker.promo_numbers') || '数字标签'}</Title>
      <Row gutter={[8, 8]}>
        {PROMO_SHAPES.map((sticker) => (
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
