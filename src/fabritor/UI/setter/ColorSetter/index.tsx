import { Popover, Button, Tooltip, Space, message } from 'antd';
import { ColorsPicker, Color } from 'react-colors-beauty';
import { BgColorsOutlined } from '@ant-design/icons';
import { useTranslation } from '@/i18n/utils';
import { useContext, useState } from 'react';
import { GlobalStateContext } from '@/context';

// @TODO preset size
export default function ColorSetter (props) {
  const { defaultColor = '#ffffff', trigger, type, value, onChange } = props;
  const { t } = useTranslation();
  const { editor } = useContext(GlobalStateContext);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleChange = (v) => {
    if (!v) return;
    if (!v.color) v.color = defaultColor;
    onChange?.(v);
  }

  // 取色笔功能 - 从画布取色
  const handleEyeDropper = async () => {
    // 优先尝试使用原生 EyeDropper API
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        const color = result.sRGBHex;
        
        onChange?.({
          type: 'solid',
          color: color
        });
        message.success(`已选取颜色: ${color}`);
        return;
      } catch (e) {
        // 用户取消了取色操作
        console.log('取色已取消');
        return;
      }
    }

    // 如果不支持 EyeDropper API，使用画布取色方案
    if (!editor?.canvas) {
      message.warning(t('common.eyedropper_not_supported'));
      return;
    }

    // 关闭颜色选择弹窗
    setPopoverOpen(false);
    
    message.info('请点击画布上的任意位置取色');
    
    const canvas = editor.canvas;
    const originalCursor = canvas.defaultCursor;
    const originalHoverCursor = canvas.hoverCursor;
    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';
    
    const handleCanvasClick = (e: any) => {
      try {
        // 获取画布的底层 canvas 元素
        const canvasEl = canvas.lowerCanvasEl || canvas.getElement();
        const ctx = canvasEl.getContext('2d');
        
        if (!ctx) {
          message.error('无法获取画布上下文');
          return;
        }
        
        // 获取鼠标在画布上的实际像素位置
        const rect = canvasEl.getBoundingClientRect();
        const scaleX = canvasEl.width / rect.width;
        const scaleY = canvasEl.height / rect.height;
        
        const x = Math.floor((e.e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.e.clientY - rect.top) * scaleY);
        
        // 获取点击位置的像素颜色
        const imageData = ctx.getImageData(x, y, 1, 1);
        const [r, g, b, a] = imageData.data;
        
        // 转换为十六进制颜色
        const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
        
        console.log('取色结果:', { x, y, r, g, b, hex });
        
        onChange?.({
          type: 'solid',
          color: hex
        });
        
        message.success(`已选取颜色: ${hex}`);
      } catch (err) {
        console.error('取色失败:', err);
        message.error('取色失败');
      } finally {
        // 恢复原来的光标
        canvas.defaultCursor = originalCursor;
        canvas.hoverCursor = originalHoverCursor;
        canvas.off('mouse:down', handleCanvasClick);
      }
    };
    
    canvas.once('mouse:down', handleCanvasClick);
  }

  const calcIconFill = () => {
    switch(value?.type) {
      case 'solid':
        return value.color;
      case 'linear':
      case 'radial':
        return `url(#colorsetter-icon-gradient) ${value.color || 'rgba(0, 0, 0, 0.88)'}`;
      default:
        return 'rgba(0, 0, 0, 0.88)';
    }
  }

  // const calcBackgroundColor = () => {
  //   switch(value?.type) {
  //     case 'solid':
  //       return value.color;
  //     case 'linear':
  //       return `linear-gradient(${value.gradient?.angle}deg, ${value.gradient?.colorStops.map(stop => `${stop.color} ${stop.offset * 100}%`)})`;
  //     case 'radial':
  //       return `radial-gradient(at 50% 50%, ${value.gradient?.colorStops.map(stop => `${stop.color} ${stop.offset * 100}%`)})`;
  //     default:
  //       return 'rgba(0, 0, 0, 0.88)';
  //   }
  // }

  const calcTriggerBg = () => {
    if (value?.type === 'solid') {
      const c = new Color(value.color);
      if (c.toHexString() === '#ffffff') {
        return 'rgba(103,103,103,0.24)';
      }
    }
    return null;
  }

  const renderTrigger = () => {
    if (trigger) return trigger;
    if (type === 'fontColor') {
      return (
        <svg viewBox="64 64 896 896" focusable="false" width={22} height={22} fill={calcIconFill()} aria-hidden="true">
          <path d="M904 816H120c-4.4 0-8 3.6-8 8v80c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-80c0-4.4-3.6-8-8-8zm-650.3-80h85c4.2 0 8-2.7 9.3-6.8l53.7-166h219.2l53.2 166c1.3 4 5 6.8 9.3 6.8h89.1c1.1 0 2.2-.2 3.2-.5a9.7 9.7 0 006-12.4L573.6 118.6a9.9 9.9 0 00-9.2-6.6H462.1c-4.2 0-7.9 2.6-9.2 6.6L244.5 723.1c-.4 1-.5 2.1-.5 3.2-.1 5.3 4.3 9.7 9.7 9.7zm255.9-516.1h4.1l83.8 263.8H424.9l84.7-263.8z"></path>
        </svg>
      )
    }
    return (
      <svg width={22} height={22} viewBox="64 64 896 896" focusable="false" fill={calcIconFill()} aria-hidden="true">
        <path d="M766.4 744.3c43.7 0 79.4-36.2 79.4-80.5 0-53.5-79.4-140.8-79.4-140.8S687 610.3 687 663.8c0 44.3 35.7 80.5 79.4 80.5zm-377.1-44.1c7.1 7.1 18.6 7.1 25.6 0l256.1-256c7.1-7.1 7.1-18.6 0-25.6l-256-256c-.6-.6-1.3-1.2-2-1.7l-78.2-78.2a9.11 9.11 0 00-12.8 0l-48 48a9.11 9.11 0 000 12.8l67.2 67.2-207.8 207.9c-7.1 7.1-7.1 18.6 0 25.6l255.9 256zm12.9-448.6l178.9 178.9H223.4l178.8-178.9zM904 816H120c-4.4 0-8 3.6-8 8v80c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-80c0-4.4-3.6-8-8-8z"></path>
      </svg>
    )
  }

  return (
    <>
      <Popover
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        content={
          <div className="fabritor-color-setter">
            <ColorsPicker
              value={value}
              onChange={handleChange}
              format="hex"
              angleType="rotate"
            />
            <div style={{ marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }}>
              <Tooltip title={t('common.eyedropper')}>
                <Button 
                  icon={<BgColorsOutlined />} 
                  onClick={handleEyeDropper}
                  size="small"
                  block
                >
                  {t('common.eyedropper')}
                </Button>
              </Tooltip>
            </div>
          </div>
        }
        trigger="click"
      >
        <div 
          className="fabritor-toolbar-item"
          style={{
            borderRadius: 4,
            backgroundColor: calcTriggerBg()
          }}
        >
          {renderTrigger()}
        </div>
      </Popover>

      <svg style={{ width:0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
        <linearGradient id="colorsetter-icon-gradient" x2="1" y2="1">
          {
            value?.gradient?.colorStops.map(stop => (
              <stop offset={`${stop.offset * 100}%`} stop-color={stop.color} />
            ))
          }
        </linearGradient>
      </svg>
    </>
  )
}