import { Modal, Form, Input, message } from 'antd';
import { useContext, useState } from 'react';
import { GlobalStateContext } from '@/context';
import { saveTemplate } from '@/utils/template';
import { useTranslation } from '@/i18n/utils';

interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SaveTemplateModal(props: SaveTemplateModalProps) {
  const { open, onClose, onSuccess } = props;
  const { editor } = useContext(GlobalStateContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 获取当前画布的 JSON
      const json = editor.canvas2Json();
      
      // 生成缩略图
      const thumbnail = editor.export2Img({ 
        format: 'png',
        quality: 0.5,
        multiplier: 0.2 // 缩略图尺寸为原图的 20%
      });

      // 保存模板（现在是异步操作）
      // 如果使用 FileSystem 且首次保存，会自动弹出目录选择
      const success = await saveTemplate({
        name: values.name,
        description: values.description,
        thumbnail,
        json
      });

      if (success) {
        message.success(t('header.template.save_success'));
        form.resetFields();
        onClose();
        onSuccess?.();
      } else {
        message.error(t('header.template.save_failed'));
      }
    } catch (e) {
      console.error('Save template error:', e);
      
      // 特殊处理用户取消选择目录的情况
      if (e instanceof Error) {
        if (e.message === 'USER_CANCELLED_DIRECTORY_SELECTION') {
          message.warning(t('header.template.directory_cancelled'));
        } else if (e.message.includes('存储空间已满')) {
          message.error(e.message);
        } else {
          message.error(t('header.template.save_failed'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={t('header.template.save_template')}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={t('common.ok')}
      cancelText={t('common.cancel')}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        <Form.Item
          name="name"
          label={t('header.template.template_name')}
          rules={[{ required: true, message: t('header.template.name_required') }]}
        >
          <Input placeholder={t('header.template.name_placeholder')} />
        </Form.Item>
        <Form.Item
          name="description"
          label={t('header.template.description')}
        >
          <Input.TextArea 
            rows={3} 
            placeholder={t('header.template.description_placeholder')} 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
