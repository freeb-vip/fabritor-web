/**
 * 预设画布规格
 * Canvas Size Presets
 */

export interface CanvasPreset {
  id: string;
  name: string;
  nameEn: string;
  category: 'ecommerce' | 'social' | 'print' | 'custom';
  width: number;
  height: number;
  desc?: string;
  descEn?: string;
}

/**
 * 电商类画布尺寸
 */
export const ECOMMERCE_PRESETS: CanvasPreset[] = [
  {
    id: 'taobao-main',
    name: '淘宝主图',
    nameEn: 'Taobao Main',
    category: 'ecommerce',
    width: 800,
    height: 800,
    desc: '正方形主图，适用于淘宝、天猫商品主图',
    descEn: 'Square main image for Taobao/Tmall products'
  },
  {
    id: 'taobao-detail',
    name: '淘宝详情页',
    nameEn: 'Taobao Detail',
    category: 'ecommerce',
    width: 790,
    height: 1000,
    desc: '适用于淘宝、天猫商品详情页',
    descEn: 'For Taobao/Tmall product detail pages'
  },
  {
    id: 'jd-main',
    name: '京东主图',
    nameEn: 'JD Main',
    category: 'ecommerce',
    width: 800,
    height: 800,
    desc: '京东商品主图',
    descEn: 'JD product main image'
  },
  {
    id: 'jd-detail',
    name: '京东详情页',
    nameEn: 'JD Detail',
    category: 'ecommerce',
    width: 750,
    height: 1000,
    desc: '京东商品详情页',
    descEn: 'JD product detail page'
  },
  {
    id: 'pdd-main',
    name: '拼多多主图',
    nameEn: 'PDD Main',
    category: 'ecommerce',
    width: 800,
    height: 800,
    desc: '拼多多商品主图',
    descEn: 'Pinduoduo product main image'
  },
  {
    id: 'shopee-main',
    name: 'Shopee 主图',
    nameEn: 'Shopee Main',
    category: 'ecommerce',
    width: 500,
    height: 500,
    desc: 'Shopee 商品主图（正方形）',
    descEn: 'Shopee product main image (square)'
  },
  {
    id: 'tiktok-main',
    name: 'TikTok 主图',
    nameEn: 'TikTok Main',
    category: 'ecommerce',
    width: 800,
    height: 800,
    desc: 'TikTok Shop 商品主图',
    descEn: 'TikTok Shop product main image'
  },
  {
    id: 'tiktok-video-cover',
    name: 'TikTok 视频封面',
    nameEn: 'TikTok Video Cover',
    category: 'ecommerce',
    width: 1080,
    height: 1920,
    desc: 'TikTok 商品视频封面（9:16）',
    descEn: 'TikTok product video cover (9:16)'
  },
  {
    id: 'banner-wide',
    name: '电商横幅 (宽)',
    nameEn: 'E-commerce Banner (Wide)',
    category: 'ecommerce',
    width: 1920,
    height: 600,
    desc: '适用于电商网站顶部横幅',
    descEn: 'For e-commerce website top banners'
  },
  {
    id: 'banner-standard',
    name: '电商横幅 (标准)',
    nameEn: 'E-commerce Banner (Standard)',
    category: 'ecommerce',
    width: 1200,
    height: 500,
    desc: '标准电商横幅尺寸',
    descEn: 'Standard e-commerce banner size'
  }
];

/**
 * 社交媒体类画布尺寸
 */
export const SOCIAL_PRESETS: CanvasPreset[] = [
  {
    id: 'xiaohongshu',
    name: '小红书',
    nameEn: 'Xiaohongshu',
    category: 'social',
    width: 1242,
    height: 1660,
    desc: '小红书封面图尺寸 3:4',
    descEn: 'Xiaohongshu cover image 3:4'
  },
  {
    id: 'wechat-moment',
    name: '微信朋友圈',
    nameEn: 'WeChat Moment',
    category: 'social',
    width: 1280,
    height: 1280,
    desc: '微信朋友圈正方形',
    descEn: 'WeChat Moments square'
  },
  {
    id: 'wechat-article',
    name: '微信公众号封面',
    nameEn: 'WeChat Article Cover',
    category: 'social',
    width: 900,
    height: 500,
    desc: '微信公众号文章首图',
    descEn: 'WeChat official account article cover'
  },
  {
    id: 'weibo-post',
    name: '微博配图',
    nameEn: 'Weibo Post',
    category: 'social',
    width: 1080,
    height: 1080,
    desc: '微博正方形配图',
    descEn: 'Weibo square post image'
  },
  {
    id: 'douyin-cover',
    name: '抖音封面',
    nameEn: 'Douyin Cover',
    category: 'social',
    width: 1080,
    height: 1920,
    desc: '抖音视频封面 9:16',
    descEn: 'Douyin video cover 9:16'
  },
  {
    id: 'instagram-post',
    name: 'Instagram 帖子',
    nameEn: 'Instagram Post',
    category: 'social',
    width: 1080,
    height: 1080,
    desc: 'Instagram 正方形帖子',
    descEn: 'Instagram square post'
  },
  {
    id: 'instagram-story',
    name: 'Instagram 故事',
    nameEn: 'Instagram Story',
    category: 'social',
    width: 1080,
    height: 1920,
    desc: 'Instagram 故事 9:16',
    descEn: 'Instagram Story 9:16'
  }
];

/**
 * 印刷类画布尺寸（单位：像素，按 300 DPI 计算）
 */
export const PRINT_PRESETS: CanvasPreset[] = [
  {
    id: 'a4',
    name: 'A4',
    nameEn: 'A4',
    category: 'print',
    width: 2480,
    height: 3508,
    desc: 'A4 纸张 (210mm × 297mm, 300 DPI)',
    descEn: 'A4 paper (210mm × 297mm, 300 DPI)'
  },
  {
    id: 'a4-landscape',
    name: 'A4 横向',
    nameEn: 'A4 Landscape',
    category: 'print',
    width: 3508,
    height: 2480,
    desc: 'A4 横向 (297mm × 210mm, 300 DPI)',
    descEn: 'A4 Landscape (297mm × 210mm, 300 DPI)'
  },
  {
    id: 'a5',
    name: 'A5',
    nameEn: 'A5',
    category: 'print',
    width: 1748,
    height: 2480,
    desc: 'A5 纸张 (148mm × 210mm, 300 DPI)',
    descEn: 'A5 paper (148mm × 210mm, 300 DPI)'
  },
  {
    id: 'business-card',
    name: '名片',
    nameEn: 'Business Card',
    category: 'print',
    width: 1063,
    height: 638,
    desc: '名片 (90mm × 54mm, 300 DPI)',
    descEn: 'Business Card (90mm × 54mm, 300 DPI)'
  },
  {
    id: 'poster-a3',
    name: 'A3 海报',
    nameEn: 'A3 Poster',
    category: 'print',
    width: 3508,
    height: 4961,
    desc: 'A3 海报 (297mm × 420mm, 300 DPI)',
    descEn: 'A3 Poster (297mm × 420mm, 300 DPI)'
  }
];

/**
 * 所有预设尺寸
 */
export const ALL_PRESETS = [
  ...ECOMMERCE_PRESETS,
  ...SOCIAL_PRESETS,
  ...PRINT_PRESETS
];

/**
 * 按分类获取预设
 */
export const getPresetsByCategory = (category: CanvasPreset['category']) => {
  return ALL_PRESETS.filter(preset => preset.category === category);
};

/**
 * 按ID获取预设
 */
export const getPresetById = (id: string) => {
  return ALL_PRESETS.find(preset => preset.id === id);
};

/**
 * 分类信息
 */
export const PRESET_CATEGORIES = [
  { key: 'ecommerce', label: '电商平台', labelEn: 'E-commerce' },
  { key: 'social', label: '社交媒体', labelEn: 'Social Media' },
  { key: 'print', label: '印刷物料', labelEn: 'Print Materials' },
  { key: 'custom', label: '自定义', labelEn: 'Custom' }
];
