import { useContext, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { Form, Input, Slider, Select, Switch, Space, Divider } from 'antd';
import { GlobalStateContext } from '@/context';
import { Trans, useTranslation } from '@/i18n/utils';

const { Item: FormItem } = Form;
const { Option } = Select;

const WATERMARK_GROUP_ID = 'watermark-preview-group';

export default function WatermarkPanel() {
  const { editor } = useContext(GlobalStateContext);
  const { t } = useTranslation();
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkConfig, setWatermarkConfig] = useState({
    text: '水印文字',
    fontSize: 48,
    opacity: 0.3,
    color: '#000000',
    fontFamily: 'Arial',
    angle: -45,
    position: 'repeat'
  });

  useEffect(() => {
    if (!editor) return;
    const { sketch } = editor;
    // @ts-ignore
    if (sketch.watermarkConfig) {
      // @ts-ignore
      setWatermarkConfig(sketch.watermarkConfig);
    }
    // @ts-ignore
    if (sketch.watermarkEnabled !== undefined) {
      // @ts-ignore
      setWatermarkEnabled(sketch.watermarkEnabled);
    }
  }, [editor]);

  const renderWatermarkPreview = () => {
    if (!editor) return;
    const { canvas, sketch } = editor;
    
    const existingGroup = canvas.getObjects().find((obj: fabric.Object) => (obj as any).id === WATERMARK_GROUP_ID);
    if (existingGroup) {
      canvas.remove(existingGroup);
    }

    if (!watermarkEnabled) {
      canvas.requestRenderAll();
      return;
    }

    const { width, height } = sketch;
    const watermarkObjects: fabric.Text[] = [];

    if (watermarkConfig.position === 'repeat') {
      const spacing = watermarkConfig.fontSize * 3;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const watermark = new fabric.Text(watermarkConfig.text, {
            left: j * spacing,
            top: i * spacing,
            fontSize: watermarkConfig.fontSize,
            fill: watermarkConfig.color,
            opacity: watermarkConfig.opacity,
            fontFamily: watermarkConfig.fontFamily,
            angle: watermarkConfig.angle,
            selectable: false,
            evented: false
          });
          watermarkObjects.push(watermark);
        }
      }
    } else {
      const watermark = new fabric.Text(watermarkConfig.text, {
        fontSize: watermarkConfig.fontSize,
        fill: watermarkConfig.color,
        opacity: watermarkConfig.opacity,
        fontFamily: watermarkConfig.fontFamily,
        angle: watermarkConfig.angle,
        selectable: false,
        evented: false
      });

      switch (watermarkConfig.position) {
        case 'center':
          watermark.set({ left: width / 2, top: height / 2, originX: 'center', originY: 'center' });
          break;
        case 'top-left':
          watermark.set({ left: 50, top: 50 });
          break;
        case 'top-right':
          watermark.set({ left: width - 50, top: 50, originX: 'right' });
          break;
        case 'bottom-left':
          watermark.set({ left: 50, top: height - 50, originY: 'bottom' });
          break;
        case 'bottom-right':
          watermark.set({ left: width - 50, top: height - 50, originX: 'right', originY: 'bottom' });
          break;
      }
      watermarkObjects.push(watermark);
    }

    if (watermarkObjects.length > 0) {
      const group = new fabric.Group(watermarkObjects, {
        selectable: false,
        evented: false,
      });
      (group as any).id = WATERMARK_GROUP_ID;
      canvas.add(group);
      group.moveTo(canvas.getObjects().length - 1);
      canvas.requestRenderAll();
    }
  };

  useEffect(() => {
    if (!editor) return;
    const { sketch } = editor;
    // @ts-ignore
    sketch.watermarkConfig = watermarkConfig;
    // @ts-ignore
    sketch.watermarkEnabled = watermarkEnabled;
    renderWatermarkPreview();
  }, [watermarkConfig, watermarkEnabled, editor]);

  const handleWatermarkChange = (field: string, value: string | number) => {
    setWatermarkConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleEnabledChange = (checked: boolean) => {
    setWatermarkEnabled(checked);
  };

  return (
    <div style={{ padding: '16px 16px 16px 0' }}>
      <FormItem label={<Trans i18nKey="setter.sketch.watermark_enabled" />}>
        <Switch checked={watermarkEnabled} onChange={handleEnabledChange} />
      </FormItem>

      {watermarkEnabled && (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Divider style={{ margin: '8px 0' }} />
          
          <FormItem label={<Trans i18nKey="setter.sketch.watermark_text" />}>
            <Input 
              value={watermarkConfig.text}
              onChange={(e) => handleWatermarkChange('text', e.target.value)}
              placeholder={t('setter.sketch.watermark_text_placeholder')}
            />
          </FormItem>

          <FormItem label={<Trans i18nKey="setter.sketch.watermark_opacity" />}>
            <Slider min={0} max={1} step={0.01} value={watermarkConfig.opacity}
              onChange={(val) => handleWatermarkChange('opacity', val)}
              marks={{ 0: '0%', 0.5: '50%', 1: '100%' }}
            />
          </FormItem>

          <FormItem label={<Trans i18nKey="setter.sketch.watermark_size" />}>
            <Slider min={12} max={200} value={watermarkConfig.fontSize}
              onChange={(val) => handleWatermarkChange('fontSize', val)}
            />
          </FormItem>

          <FormItem label={<Trans i18nKey="setter.sketch.watermark_color" />}>
            <Input type="color" value={watermarkConfig.color}
              onChange={(e) => handleWatermarkChange('color', e.target.value)}
              style={{ width: 100 }}
            />
          </FormItem>

          <FormItem label={<Trans i18nKey="setter.sketch.watermark_font" />}>
            <Select value={watermarkConfig.fontFamily}
              onChange={(val) => handleWatermarkChange('fontFamily', val)}>
              <Option value="Arial">Arial</Option>
              <Option value="Times New Roman">Times New Roman</Option>
              <Option value="Courier New">Courier New</Option>
              <Option value="Georgia">Georgia</Option>
              <Option value="Verdana">Verdana</Option>
            </Select>
          </FormItem>

          <FormItem label={<Trans i18nKey="setter.sketch.watermark_angle" />}>
            <Slider min={-90} max={90} value={watermarkConfig.angle}
              onChange={(val) => handleWatermarkChange('angle', val)}
              marks={{ '-90': '-90°', '-45': '-45°', 0: '0°', 45: '45°', 90: '90°' }}
            />
          </FormItem>

          <FormItem label={<Trans i18nKey="setter.sketch.watermark_position" />}>
            <Select value={watermarkConfig.position}
              onChange={(val) => handleWatermarkChange('position', val)}>
              <Option value="center">{t('setter.sketch.watermark_position_center')}</Option>
              <Option value="top-left">{t('setter.sketch.watermark_position_topleft')}</Option>
              <Option value="top-right">{t('setter.sketch.watermark_position_topright')}</Option>
              <Option value="bottom-left">{t('setter.sketch.watermark_position_bottomleft')}</Option>
              <Option value="bottom-right">{t('setter.sketch.watermark_position_bottomright')}</Option>
              <Option value="repeat">{t('setter.sketch.watermark_position_repeat')}</Option>
            </Select>
          </FormItem>
        </Space>
      )}
    </div>
  );
}
