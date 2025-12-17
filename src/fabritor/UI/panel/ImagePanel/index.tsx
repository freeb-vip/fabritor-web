import { createFImage } from '@/editor/objects/image';
import { useContext, useRef } from 'react';
import ImageSelector from '@/fabritor/components/ImageSelector';
import { GlobalStateContext } from '@/context';

export default function ImagePanel () {
  const { editor } = useContext(GlobalStateContext);
  const isFirstImageRef = useRef(true);

  // 检查画布上是否已有图片
  const hasImageOnCanvas = () => {
    if (!editor?.canvas) return false;
    const objects = editor.canvas.getObjects();
    return objects.some(obj => obj.type === 'image' || obj.type === 'f-image');
  };

  // 适应画布 - 覆盖模式，右下角对齐
  const fitImageToCanvas = (imageObj) => {
    if (!editor?.canvas || !imageObj) return;
    
    const { sketch } = editor;
    const canvasWidth = sketch.width;
    const canvasHeight = sketch.height;
    
    // 计算缩放比例，使用 cover 模式
    const scaleX = canvasWidth / imageObj.width;
    const scaleY = canvasHeight / imageObj.height;
    const scale = Math.max(scaleX, scaleY);
    
    imageObj.set({
      scaleX: scale,
      scaleY: scale,
      // 右下角对齐
      left: canvasWidth - (imageObj.width * scale),
      top: canvasHeight - (imageObj.height * scale)
    });
    
    editor.canvas.requestRenderAll();
  };

  const addImage = async (url) => {
    const shouldFitCanvas = !hasImageOnCanvas();
    
    const fimg = await createFImage({
      imageSource: url,
      canvas: editor.canvas
    });

    // 如果是第一张图片，自动适应画布
    if (shouldFitCanvas && fimg) {
      // 延迟执行以确保图片已完全加载
      setTimeout(() => {
        const activeObject = editor.canvas.getActiveObject();
        if (activeObject) {
          fitImageToCanvas(activeObject);
        }
      }, 100);
    }
  }

  return (
    <div className="fabritor-panel-wrapper">
      <ImageSelector onChange={addImage} />
    </div>
  )
}