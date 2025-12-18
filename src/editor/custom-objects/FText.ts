import { fabric } from 'fabric';
const clone = fabric.util.object.clone;

const additionalProps =
('fontFamily fontWeight fontSize text underline overline linethrough' +
' textAlign fontStyle lineHeight textBackgroundColor charSpacing styles' +
' direction path pathStartOffset pathSide pathAlign minWidth splitByGrapheme' +
' boxBackgroundColor boxBorderRadius boxPadding').split(' ');

export const createFTextClass = () => {
  // @ts-ignore custom f-text
  fabric.FText = fabric.util.createClass(fabric.Textbox, {
    type: 'f-text',

    padding: 0,

    paintFirst: 'stroke',

    // 文本框背景颜色
    boxBackgroundColor: '',

    // 文本框圆角
    boxBorderRadius: 0,

    // 文本框内边距
    boxPadding: 0,

    initDimensions: function() {
      if (this.__skipDimension) {
        return;
      }
      this.isEditing && this.initDelayedCursor();
      this.clearContextTop();
      this._clearCache();
      // clear dynamicMinWidth as it will be different after we re-wrap line
      this.dynamicMinWidth = 0;
      // wrap lines
      this._styleMap = this._generateStyleMap(this._splitText());
      // if after wrapping, the width is smaller than dynamicMinWidth, change the width and re-wrap
      if (this.dynamicMinWidth > this.width) {
        this._set('width', this.dynamicMinWidth);
      }
      if (this.textAlign.indexOf('justify') !== -1) {
        // once text is measured we need to make space fatter to make justified text.
        this.enlargeSpaces();
      }
      // clear cache and re-calculate height
      const height = this.calcTextHeight();
      if (!this.path) {
        this.height = height;
      } else {
        this.height = this.path.height > height ? this.path.height : height;
      }
      this.saveState({ propertySet: '_dimensionAffectingProps' });
    },

    // 重写 _render 方法来绘制背景
    _render: function(ctx) {
      // 绘制文本框背景（带圆角）
      if (this.boxBackgroundColor && this.boxBackgroundColor !== 'transparent') {
        ctx.save();
        const padding = this.boxPadding || 0;
        const w = this.width + padding * 2;
        const h = this.height + padding * 2;
        const x = -this.width / 2 - padding;
        const y = -this.height / 2 - padding;
        const r = this.boxBorderRadius || 0;

        ctx.beginPath();
        if (r > 0) {
          // 绘制圆角矩形
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.arcTo(x + w, y, x + w, y + r, r);
          ctx.lineTo(x + w, y + h - r);
          ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
          ctx.lineTo(x + r, y + h);
          ctx.arcTo(x, y + h, x, y + h - r, r);
          ctx.lineTo(x, y + r);
          ctx.arcTo(x, y, x + r, y, r);
        } else {
          ctx.rect(x, y, w, h);
        }
        ctx.closePath();
        ctx.fillStyle = this.boxBackgroundColor;
        ctx.fill();
        ctx.restore();
      }
      // 调用父类的 _render 方法绘制文本
      this.callSuper('_render', ctx);
    },

    toObject: function(propertiesToInclude) {
      const allProperties = additionalProps.concat(propertiesToInclude);
      const obj = this.callSuper('toObject', allProperties);
      obj.styles = fabric.util.stylesToArray(this.styles, this.text);
      if (obj.path) {
        obj.path = this.path.toObject();
      }
      return obj;
    },
  });

  fabric.FText.fromObject = function(object, callback) {
    const objectCopy = clone(object), path = object.path;
    delete objectCopy.path;
    return fabric.Object._fromObject('FText', objectCopy, function(textInstance) {
      textInstance.styles = fabric.util.stylesFromArray(object.styles, object.text);
      if (path) {
        fabric.Object._fromObject('Path', path, function(pathInstance) {
          textInstance.set('path', pathInstance);
          callback(textInstance);
        }, 'path');
      }
      else {
        callback(textInstance);
      }
    }, 'text');
  };
}