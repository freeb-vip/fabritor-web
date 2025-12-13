import { Modal, Tabs, Card, Row, Col, Input, Form, message } from 'antd';
import { useState } from 'react';
import { 
  ALL_PRESETS, 
  PRESET_CATEGORIES, 
  getPresetsByCategory,
  type CanvasPreset 
} from '@/utils/canvas-presets';
import { useTranslation } from '@/i18n/utils';

interface CanvasSizeModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (preset: CanvasPreset | { width: number; height: number }) => void;
}

export default function CanvasSizeModal(props: CanvasSizeModalProps) {
  const { open, onClose, onSelect } = props;
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const isZh = i18n.language === 'zh-CN';

  const handlePresetClick = (preset: CanvasPreset) => {
    onSelect(preset);
    onClose();
    message.success(t('canvas_size.apply_success', { 
      name: isZh ? preset.name : preset.nameEn,
      width: preset.width,
      height: preset.height
    }));
  };

  const handleCustomSubmit = () => {
    form.validateFields().then(values => {
      onSelect({
        width: Number(values.width),
        height: Number(values.height)
      });
      onClose();
      message.success(t('canvas_size.apply_success', { 
        name: t('canvas_size.custom'),
        width: values.width,
        height: values.height
      }));
    });
  };

  const renderPresetCard = (preset: CanvasPreset) => {
    const ratio = preset.width / preset.height;
    const displayWidth = ratio > 1 ? 100 : 100 * ratio;
    const displayHeight = ratio > 1 ? 100 / ratio : 100;

    return (
      <Card
        hoverable
        onClick={() => handlePresetClick(preset)}
        style={{ marginBottom: 16 }}
        styles={{
          body: { padding: 16 }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 100,
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f0f0',
              borderRadius: 4
            }}
          >
            <div
              style={{
                width: displayWidth,
                height: displayHeight,
                backgroundColor: '#1890ff',
                border: '2px solid #096dd9',
                borderRadius: 2
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
              {isZh ? preset.name : preset.nameEn}
            </div>
            <div style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>
              {preset.width} × {preset.height} px
            </div>
            {preset.desc && (
              <div style={{ color: '#999', fontSize: 12 }}>
                {isZh ? preset.desc : preset.descEn}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const tabItems = PRESET_CATEGORIES.map(category => ({
    key: category.key,
    label: isZh ? category.label : category.labelEn,
    children: (
      <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 8 }}>
        {category.key === 'custom' ? (
          <Card>
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t('canvas_size.width')}
                    name="width"
                    rules={[
                      { required: true, message: t('canvas_size.width_required') },
                      { 
                        pattern: /^[1-9]\d*$/, 
                        message: t('canvas_size.width_invalid') 
                      }
                    ]}
                  >
                    <Input 
                      placeholder={t('canvas_size.width_placeholder')}
                      suffix="px"
                      type="number"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('canvas_size.height')}
                    name="height"
                    rules={[
                      { required: true, message: t('canvas_size.height_required') },
                      { 
                        pattern: /^[1-9]\d*$/, 
                        message: t('canvas_size.height_invalid') 
                      }
                    ]}
                  >
                    <Input 
                      placeholder={t('canvas_size.height_placeholder')}
                      suffix="px"
                      type="number"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        ) : (
          getPresetsByCategory(category.key as any).map(preset => (
            <div key={preset.id}>
              {renderPresetCard(preset)}
            </div>
          ))
        )}
      </div>
    )
  }));

  return (
    <Modal
      title={t('canvas_size.title')}
      open={open}
      onCancel={onClose}
      width={700}
      footer={null}
      destroyOnClose
    >
      <Tabs 
        items={tabItems}
        onTabClick={(key) => {
          if (key === 'custom') {
            form.resetFields();
          }
        }}
      />
      <div style={{ textAlign: 'right', marginTop: 16 }}>
        {form && (
          <Form.Provider>
            <div
              onClick={handleCustomSubmit}
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#1890ff',
                color: '#fff',
                borderRadius: 4,
                cursor: 'pointer',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#40a9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1890ff';
              }}
            >
              {t('canvas_size.apply')}
            </div>
          </Form.Provider>
        )}
      </div>
    </Modal>
  );
}
