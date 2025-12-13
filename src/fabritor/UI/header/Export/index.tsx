import { Dropdown, Button, message } from 'antd';
import { ExportOutlined, FileOutlined, SaveOutlined, FolderOutlined, ColumnWidthOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { downloadFile, base64ToBlob } from '@/utils';
import { useContext, useRef, useState } from 'react';
import { GlobalStateContext } from '@/context';
import LocalFileSelector from '@/fabritor/components/LocalFileSelector';
import SaveTemplateModal from '@/fabritor/components/SaveTemplateModal';
import TemplateManagerModal from '@/fabritor/components/TemplateManagerModal';
import CanvasSizeModal from '@/fabritor/components/CanvasSizeModal';
import { CenterV } from '@/fabritor/components/Center';
import { SETTER_WIDTH } from '@/config';
import { Trans, useTranslation } from '@/i18n/utils';
import type { CanvasPreset } from '@/utils/canvas-presets';

const i18nKeySuffix = 'header.export';

const items: MenuProps['items'] = ['jpg', 'png', 'svg', 'json', 'divider', 'clipboard'].map(
  item => item === 'divider' ? ({ type: 'divider' }) : ({ key: item, label: <Trans i18nKey={`${i18nKeySuffix}.${item}`} /> })
)

export default function Export () {
  const { editor, setReady, setActiveObject } = useContext(GlobalStateContext);
  const localFileSelectorRef = useRef<any>();
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [manageTemplateOpen, setManageTemplateOpen] = useState(false);
  const [canvasSizeOpen, setCanvasSizeOpen] = useState(false);
  const { t } = useTranslation();

  const selectJsonFile = () => {
    localFileSelectorRef.current?.start?.();
  }

  const handleFileChange = (file) => {
    setReady(false);
    const reader = new FileReader();
    reader.onload = (async (evt) => {
      const json = evt.target?.result as string;
      if (json) {
        await editor.loadFromJSON(json, true);
        editor.fhistory.reset();
        setReady(true);
        setActiveObject(null);
        editor.fireCustomModifiedEvent();
      }
    });
    reader.readAsText(file);
  }

  const copyImage = async () => {
    try {
      const png = editor.export2Img({ format: 'png' });
      const blob = await base64ToBlob(png);
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      message.success(t(`${i18nKeySuffix}.copy_success`));
    } catch(e) {
      message.error(t(`${i18nKeySuffix}.copy_fail`));
    }
  }

  const handleClick = ({ key }) => {
    const { sketch } = editor;
    // @ts-ignore
    const name = sketch.fabritor_desc;
    switch (key) {
      case 'png':
        const png = editor.export2Img({ format: 'png' });
        downloadFile(png, 'png', name);
        break;
      case 'jpg':
        const jpg = editor.export2Img({ format: 'jpeg' });
        downloadFile(jpg, 'jpg', name);
        break;
      case 'svg':
        const svg = editor.export2Svg();
        downloadFile(svg, 'svg', name);
        break;
      case 'json':
        const json = editor.canvas2Json();
        downloadFile(`data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(json, null, 2)
        )}`, 'json', name);
        break;
      case 'clipboard':
        copyImage();
        break;
      default:
        break;
    }
  }

  const handleCanvasSizeSelect = (preset: CanvasPreset | { width: number; height: number }) => {
    editor.setSketchSize({
      width: preset.width,
      height: preset.height
    });
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent();
  }

  return (
    <CenterV
      justify="flex-end"
      gap={16}
      style={{
        width: SETTER_WIDTH,
        paddingRight: 16
      }}
    >
      <Button onClick={selectJsonFile} icon={<FileOutlined />}>
        {t(`${i18nKeySuffix}.load`)}
      </Button>
      <Button onClick={() => setCanvasSizeOpen(true)} icon={<ColumnWidthOutlined />}>
        {t(`${i18nKeySuffix}.canvas_size`)}
      </Button>
      <Button onClick={() => setSaveTemplateOpen(true)} icon={<SaveOutlined />}>
        {t(`${i18nKeySuffix}.save_template`)}
      </Button>
      <Button onClick={() => setManageTemplateOpen(true)} icon={<FolderOutlined />}>
        {t(`${i18nKeySuffix}.my_templates`)}
      </Button>
      <Dropdown 
        menu={{ items, onClick: handleClick }} 
        arrow={{ pointAtCenter: true }}
        placement="bottom"
      >
        <Button type="primary" icon={<ExportOutlined />}>{t(`${i18nKeySuffix}.export`)}</Button>
      </Dropdown>
      <LocalFileSelector accept="application/json" ref={localFileSelectorRef} onChange={handleFileChange} />
      <SaveTemplateModal 
        open={saveTemplateOpen} 
        onClose={() => setSaveTemplateOpen(false)}
        onSuccess={() => {}}
      />
      <TemplateManagerModal
        open={manageTemplateOpen}
        onClose={() => setManageTemplateOpen(false)}
      />
      <CanvasSizeModal
        open={canvasSizeOpen}
        onClose={() => setCanvasSizeOpen(false)}
        onSelect={handleCanvasSizeSelect}
      />
    </CenterV>
  )
}