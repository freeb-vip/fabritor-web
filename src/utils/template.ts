/**
 * 模板管理工具
 * 兼容旧版 API，内部使用新的智能存储管理器
 */

import { templateStorage, Template } from './storage';

export type { Template };

/**
 * 获取所有模板
 */
export const getAllTemplates = async (): Promise<Template[]> => {
  try {
    return await templateStorage.getAllTemplates();
  } catch (e) {
    console.error('Failed to get templates:', e);
    return [];
  }
};

/**
 * 保存模板
 */
export const saveTemplate = async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  try {
    await templateStorage.saveTemplate(template);
    return true;
  } catch (e) {
    console.error('Failed to save template:', e);
    return false;
  }
};

/**
 * 更新模板
 */
export const updateTemplate = async (id: string, updates: Partial<Template>): Promise<boolean> => {
  try {
    return await templateStorage.updateTemplate(id, updates);
  } catch (e) {
    console.error('Failed to update template:', e);
    return false;
  }
};

/**
 * 删除模板
 */
export const deleteTemplate = async (id: string): Promise<boolean> => {
  try {
    return await templateStorage.deleteTemplate(id);
  } catch (e) {
    console.error('Failed to delete template:', e);
    return false;
  }
};

/**
 * 获取单个模板
 */
export const getTemplate = async (id: string): Promise<Template | null> => {
  try {
    return await templateStorage.getTemplate(id);
  } catch (e) {
    console.error('Failed to get template:', e);
    return null;
  }
};

/**
 * 清空所有模板
 */
export const clearAllTemplates = async (): Promise<boolean> => {
  try {
    return await templateStorage.clearAllTemplates();
  } catch (e) {
    console.error('Failed to clear templates:', e);
    return false;
  }
};

/**
 * 导出所有模板为 JSON 文件
 */
export const exportTemplates = async (): Promise<void> => {
  return templateStorage.exportTemplates();
};

/**
 * 从 JSON 文件导入模板
 */
export const importTemplates = async (file: File): Promise<boolean> => {
  return templateStorage.importTemplates(file);
};

/**
 * 获取存储信息
 */
export const getStorageInfo = async () => {
  return templateStorage.getStorageInfo();
};
