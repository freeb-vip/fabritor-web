import { Flex, List, Empty, Button, Divider } from 'antd';
import { useEffect, useContext, useState, useRef } from 'react';
import { GlobalStateContext } from '@/context';
import { SKETCH_ID } from '@/utils/constants';
import { GroupOutlined, HeartTwoTone, HolderOutlined } from '@ant-design/icons';
import ContextMenu from '@/fabritor/components/ContextMenu';
import DEMOJSON from '@/assets/demo.json';
import { useTranslation } from '@/i18n/utils';

export default function Layer () {
  const { isReady, setReady, object: activeObject, setActiveObject, editor } = useContext(GlobalStateContext);
  const [layers, setLayers] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  const getCanvasLayers = (objects) => {
    const _layers: any = [];
    const length = objects.length;
    if (!length) {
      setLayers([]);
      return;
    }
    const activeObject = editor?.canvas.getActiveObject();
    for (let i = length - 1; i >= 0; i--) {
      let object = objects[i];
      if (object && object.id !== SKETCH_ID) {
        if (activeObject === object) {
          object.__cover = object.toDataURL();
        } else {
          if (!object.__cover) {
            object.__cover = object.toDataURL();
          }
        }

        _layers.push({
          cover: object.__cover,
          group: object.type === 'group',
          object
        });
      }
    }
    setLayers(_layers);
  }

  const loadDemo = async () => {
    setReady(false);
    await editor.loadFromJSON(DEMOJSON, true);
    editor.fhistory.reset();
    setReady(true);
    setActiveObject(null);
    editor.fireCustomModifiedEvent();
  }

  const handleItemClick = (item) => {
    editor.canvas.discardActiveObject();
    editor.canvas.setActiveObject(item.object);
    editor.canvas.requestRenderAll();
  }

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // 设置拖拽时的视觉效果
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }

  // 拖拽结束
  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }

  // 拖拽离开
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  }

  // 放下
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    // 获取画布对象
    const canvasObjects = editor.canvas.getObjects();
    const sketch = canvasObjects.find(obj => obj.id === SKETCH_ID);
    
    // 获取所有非画布对象
    const nonSketchObjects = canvasObjects.filter(obj => obj.id !== SKETCH_ID);
    
    // 获取要移动的对象
    const draggedObject = layers[draggedIndex].object;
    
    // 在非画布对象数组中找到源和目标位置
    // layers是倒序的,所以需要转换
    const actualFromIndex = nonSketchObjects.length - 1 - draggedIndex;
    const actualToIndex = nonSketchObjects.length - 1 - dropIndex;
    
    // 移除被拖拽的对象
    nonSketchObjects.splice(actualFromIndex, 1);
    // 插入到新位置
    nonSketchObjects.splice(actualToIndex, 0, draggedObject);
    
    // 清空画布
    editor.canvas.remove(...canvasObjects);
    
    // 重新添加：先添加画布(最底层),然后添加其他对象
    if (sketch) {
      editor.canvas.add(sketch);
    }
    nonSketchObjects.forEach(obj => {
      editor.canvas.add(obj);
    });
    
    // 刷新画布
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent();
    
    // 更新layers显示
    getCanvasLayers(editor.canvas.getObjects());
  }


  useEffect(() => {
    let canvas;
    const initCanvasLayers = () => { getCanvasLayers(canvas.getObjects()); }

    if (isReady) {
      setLayers([]);
      canvas = editor?.canvas;
      initCanvasLayers();

      canvas.on({
        'object:added': initCanvasLayers,
        'object:removed': initCanvasLayers,
        'object:modified': initCanvasLayers,
        'object:skewing': initCanvasLayers,
        'fabritor:object:modified': initCanvasLayers
      });
    }

    return () => {
      if (canvas) {
        canvas.off({
          'object:added': initCanvasLayers,
          'object:removed':initCanvasLayers,
          'object:modified': initCanvasLayers,
          'object:skewing': initCanvasLayers,
          'fabritor:object:modified': initCanvasLayers
        });
      }
    }
  }, [isReady]);

  return (
    <div
      className="fabritor-panel-wrapper"
    >
      {
        layers.length ? 
        <List
          dataSource={layers}
          renderItem={(item: any, index: number) => (
            <ContextMenu object={item.object} noCareOpen>
              <List.Item
                className="fabritor-list-item"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                style={{
                  border: activeObject === item.object ? ' 2px solid #ff2222' : '2px solid transparent',
                  borderTop: dragOverIndex === index && draggedIndex !== null && draggedIndex !== index 
                    ? '2px solid #1890ff' 
                    : undefined,
                  padding: '10px 16px',
                  cursor: 'move',
                  transition: 'all 0.2s',
                  backgroundColor: draggedIndex === index ? '#f5f5f5' : 'transparent'
                }}
                onClick={() => { handleItemClick(item) }}
              >
                <Flex justify="space-between" align="center" style={{ width: '100%', height: 40 }}>
                  <Flex align="center" gap={8}>
                    <HolderOutlined style={{ fontSize: 14, color: '#999', cursor: 'grab' }} />
                    <img src={item.cover} style={{ maxWidth: 180, maxHeight: 34 }} />
                  </Flex>
                  {
                    item.group ?
                    <GroupOutlined style={{ fontSize: 18, color: 'rgba(17, 23, 29, 0.6)' }} /> : null
                  }
                </Flex>
              </List.Item>
            </ContextMenu>
          )}
        /> :
        <Empty
          image={null}
          description={
            <div>
              <HeartTwoTone twoToneColor="#eb2f96" style={{ fontSize: 40 }} />
              <p style={{ color: '#aaa', fontSize: 16 }}>{t('panel.design.start')}</p>
              <Divider />
              <Button onClick={loadDemo}>{t('panel.design.start_demo')}</Button>
            </div>
          }
        />
      }
    </div>
  )
}