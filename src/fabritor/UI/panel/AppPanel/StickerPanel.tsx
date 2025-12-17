import { useContext } from 'react';
import { Card, Row, Col, message } from 'antd';
import AppSubPanel from './AppSubPanel';
import { GlobalStateContext } from '@/context';
import { createImage } from '@/editor/objects/image';
import { Trans } from '@/i18n/utils';

// 常用贴图列表 - 使用 emoji SVG 和常见图形
const STICKER_LIST = [
  // 表情类
  { key: 'star', label: '⭐', emoji: '⭐', type: 'emoji' },
  { key: 'heart', label: '❤️', emoji: '❤️', type: 'emoji' },
  { key: 'fire', label: '🔥', emoji: '🔥', type: 'emoji' },
  { key: 'thumbsup', label: '👍', emoji: '👍', type: 'emoji' },
  { key: 'check', label: '✅', emoji: '✅', type: 'emoji' },
  { key: 'cross', label: '❌', emoji: '❌', type: 'emoji' },
  { key: 'sparkles', label: '✨', emoji: '✨', type: 'emoji' },
  { key: 'crown', label: '👑', emoji: '👑', type: 'emoji' },
  { key: 'gift', label: '🎁', emoji: '🎁', type: 'emoji' },
  { key: 'rocket', label: '🚀', emoji: '🚀', type: 'emoji' },
  { key: 'trophy', label: '🏆', emoji: '🏆', type: 'emoji' },
  { key: 'diamond', label: '💎', emoji: '💎', type: 'emoji' },
  // 箭头和指示
  { key: 'arrow-right', label: '➡️', emoji: '➡️', type: 'emoji' },
  { key: 'arrow-up', label: '⬆️', emoji: '⬆️', type: 'emoji' },
  { key: 'arrow-down', label: '⬇️', emoji: '⬇️', type: 'emoji' },
  { key: 'point-right', label: '👉', emoji: '👉', type: 'emoji' },
  { key: 'point-down', label: '👇', emoji: '👇', type: 'emoji' },
  { key: 'exclamation', label: '❗', emoji: '❗', type: 'emoji' },
  { key: 'question', label: '❓', emoji: '❓', type: 'emoji' },
  { key: 'bell', label: '🔔', emoji: '🔔', type: 'emoji' },
  // 促销类
  { key: 'sale', label: '🏷️', emoji: '🏷️', type: 'emoji' },
  { key: 'money', label: '💰', emoji: '💰', type: 'emoji' },
  { key: 'hot', label: '🌶️', emoji: '🌶️', type: 'emoji' },
  { key: 'new', label: '🆕', emoji: '🆕', type: 'emoji' },
  { key: 'free', label: '🆓', emoji: '🆓', type: 'emoji' },
  { key: 'percent', label: '💯', emoji: '💯', type: 'emoji' },
  { key: 'megaphone', label: '📢', emoji: '📢', type: 'emoji' },
  { key: 'ribbon', label: '🎀', emoji: '🎀', type: 'emoji' },
  // 更多常用
  { key: 'camera', label: '📷', emoji: '📷', type: 'emoji' },
  { key: 'cart', label: '🛒', emoji: '🛒', type: 'emoji' },
  { key: 'package', label: '📦', emoji: '📦', type: 'emoji' },
  { key: 'clock', label: '⏰', emoji: '⏰', type: 'emoji' },
];

// 将 emoji 转换为 SVG 图片 URL
const emojiToSvgDataUrl = (emoji: string, size = 128): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="${size * 0.8}">
        ${emoji}
      </text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export default function StickerPanel(props) {
  const { back } = props;
  const { editor } = useContext(GlobalStateContext);

  const handleStickerClick = async (sticker) => {
    if (!editor?.canvas) {
      message.warning('请先打开画布');
      return;
    }

    try {
      // 将 emoji 转换为图片添加到画布
      const svgUrl = emojiToSvgDataUrl(sticker.emoji, 200);
      await createImage({
        imageSource: svgUrl,
        canvas: editor.canvas,
      });
    } catch (e) {
      console.error('添加贴图失败:', e);
      message.error('添加贴图失败');
    }
  };

  return (
    <AppSubPanel title={<Trans i18nKey="panel.app.sticker" />} back={back}>
      <div style={{ padding: '8px 0', maxHeight: '70vh', overflowY: 'auto' }}>
        <Row gutter={[8, 8]}>
          {STICKER_LIST.map((sticker) => (
            <Col span={6} key={sticker.key}>
              <Card
                hoverable
                size="small"
                style={{ 
                  textAlign: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
                bodyStyle={{ padding: '8px 0' }}
                onClick={() => handleStickerClick(sticker)}
              >
                <span style={{ fontSize: 28 }}>{sticker.emoji}</span>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </AppSubPanel>
  );
}
