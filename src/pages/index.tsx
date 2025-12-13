import { definePageConfig } from 'ice';
import Fabritor from '@/fabritor';

export const pageConfig = definePageConfig(() => ({
  title: '图片快速处理工具'
}));

export default function () {
  return <Fabritor />;
}
