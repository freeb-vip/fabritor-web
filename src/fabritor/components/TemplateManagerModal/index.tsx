import { Modal, List, Button, Popconfirm, Empty, Image, message, Space, Alert } from 'antd';
import { DeleteOutlined, DownloadOutlined, UploadOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useContext, useState, useEffect, useRef } from 'react';
import { GlobalStateContext } from '@/context';
import { getAllTemplates, deleteTemplate, Template, exportTemplates, importTemplates } from '@/utils/template';
import { templateStorage } from '@/utils/storage';
import { useTranslation } from '@/i18n/utils';
import LocalFileSelector from '../LocalFileSelector';
import dayjs from 'dayjs';

interface TemplateManagerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TemplateManagerModal(props: TemplateManagerModalProps) {
  const { open, onClose } = props;
  const { editor, setReady, setActiveObject } = useContext(GlobalStateContext);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [storageType, setStorageType] = useState<string>('');
  const [directoryName, setDirectoryName] = useState<string | null>(null);
  const { t } = useTranslation();
  const localFileSelectorRef = useRef<any>();

  const loadTemplates = async () => {
    const allTemplates = await getAllTemplates();
    setTemplates(allTemplates);
  };

  const loadStorageInfo = async () => {
    await templateStorage.init();
    const type = templateStorage.getStorageType();
    setStorageType(type || '');
    
    // 如果是文件系统存储，获取目录名称
    if (type === 'filesystem') {
      const dirName = await templateStorage.getFileSystemDirectoryName();
      setDirectoryName(dirName);
    }
  };

  useEffect(() => {
    if (open) {
      loadTemplates();
      loadStorageInfo();
    }
  }, [open]);

  const handleLoadTemplate = async (template: Template) => {
    setLoading(true);
    setReady(false);
    try {
      await editor.loadFromJSON(template.json, true);
      editor.fhistory.reset();
      setReady(true);
      setActiveObject(null);
      editor.fireCustomModifiedEvent();
      message.success(t('header.template.load_success'));
      onClose();
    } catch (e) {
      message.error(t('header.template.load_failed'));
      setReady(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteTemplate(id);
    if (success) {
      message.success(t('header.template.delete_success'));
      loadTemplates();
    } else {
      message.error(t('header.template.delete_failed'));
    }
  };

  const handleExport = async () => {
    await exportTemplates();
    message.success(t('header.template.export_success'));
  };

  const handleImportClick = () => {
    localFileSelectorRef.current?.start?.();
  };

  const handleFileChange = async (file) => {
    try {
      await importTemplates(file);
      message.success(t('header.template.import_success'));
      loadTemplates();
    } catch (e) {
      message.error(t('header.template.import_failed'));
    }
  };

  // 选择文件系统目录
  const handleSelectDirectory = async () => {
    try {
      const success = await templateStorage.requestFileSystemDirectory();
      if (success) {
        message.success(t('header.template.directory_selected'));
        loadStorageInfo();
      }
    } catch (e) {
      message.error(t('header.template.directory_select_failed'));
    }
  };

  return (
    <Modal
      title={t('header.template.manage_templates')}
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        storageType === 'filesystem' && (
          <Button key="select-dir" icon={<FolderOpenOutlined />} onClick={handleSelectDirectory}>
            {t('header.template.select_directory')}
          </Button>
        ),
        <Button key="import" icon={<UploadOutlined />} onClick={handleImportClick}>
          {t('header.template.import')}
        </Button>,
        <Button key="export" icon={<DownloadOutlined />} onClick={handleExport}>
          {t('header.template.export')}
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          {t('common.close')}
        </Button>
      ]}
    >
      {/* 存储信息提示 */}
      {storageType && (
        <Alert
          message={
            storageType === 'filesystem' && directoryName
              ? `${t('header.template.storage_type')}: ${t(`header.template.${storageType}`)} - ${directoryName}`
              : `${t('header.template.storage_type')}: ${t(`header.template.${storageType}`)}`
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {templates.length === 0 ? (
        <Empty 
          description={t('header.template.no_templates')}
          style={{ margin: '40px 0' }}
        />
      ) : (
        <List
          loading={loading}
          dataSource={templates}
          renderItem={(template) => (
            <List.Item
              actions={[
                <Button 
                  key="load" 
                  type="primary"
                  onClick={() => handleLoadTemplate(template)}
                >
                  {t('header.template.load')}
                </Button>,
                <Popconfirm
                  key="delete"
                  title={t('header.template.delete_confirm')}
                  onConfirm={() => handleDelete(template.id)}
                  okText={t('common.ok')}
                  cancelText={t('common.cancel')}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    {t('header.template.delete')}
                  </Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={
                  template.thumbnail ? (
                    <Image 
                      src={template.thumbnail} 
                      width={80} 
                      height={80} 
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                      preview={false}
                    />
                  ) : (
                    <div style={{ 
                      width: 80, 
                      height: 80, 
                      backgroundColor: '#f0f0f0', 
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {t('header.template.no_preview')}
                    </div>
                  )
                }
                title={template.name}
                description={
                  <Space direction="vertical" size={4}>
                    {template.description && <div>{template.description}</div>}
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {t('header.template.created_at')}: {dayjs(template.createdAt).format('YYYY-MM-DD HH:mm')}
                    </div>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
      <LocalFileSelector 
        accept="application/json" 
        ref={localFileSelectorRef} 
        onChange={handleFileChange} 
      />
    </Modal>
  );
}
