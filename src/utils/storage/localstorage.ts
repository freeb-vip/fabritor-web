/**
 * LocalStorage 存储实现
 * 兼容性最好，但容量小（5-10MB）
 * 作为最终降级方案
 */

import { BaseTemplateStorage, Template } from './base';

const STORAGE_KEY = 'fabritor_templates';

export class LocalStorageStorage extends BaseTemplateStorage {
  readonly type = 'localstorage' as const;

  async init(): Promise<void> {
    // localStorage 不需要初始化
  }

  async isSupported(): Promise<boolean> {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  async getAll(): Promise<Template[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const templates = JSON.parse(data) as Template[];
      // 按创建时间倒序排序
      return templates.sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
      console.error('Failed to get templates from localStorage:', e);
      return [];
    }
  }

  async save(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const templates = await this.getAll();
      const newTemplate = this.createTemplate(template);
      
      templates.unshift(newTemplate);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
      
      return newTemplate.id;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        throw new Error('存储空间已满，请删除一些模板或导出备份');
      }
      throw e;
    }
  }

  async update(id: string, updates: Partial<Template>): Promise<boolean> {
    try {
      const templates = await this.getAll();
      const index = templates.findIndex(t => t.id === id);
      
      if (index === -1) return false;
      
      templates[index] = {
        ...templates[index],
        ...updates,
        updatedAt: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
      return true;
    } catch (e) {
      console.error('Failed to update template:', e);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const templates = await this.getAll();
      const filtered = templates.filter(t => t.id !== id);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Failed to delete template:', e);
      return false;
    }
  }

  async get(id: string): Promise<Template | null> {
    const templates = await this.getAll();
    return templates.find(t => t.id === id) || null;
  }

  async clear(): Promise<boolean> {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Failed to clear templates:', e);
      return false;
    }
  }

  async getStorageInfo(): Promise<{ used: number; available: number; percentage: number }> {
    try {
      const data = localStorage.getItem(STORAGE_KEY) || '[]';
      const used = new Blob([data]).size;
      const available = 5 * 1024 * 1024; // 假设 5MB 限制
      
      return {
        used,
        available,
        percentage: (used / available) * 100
      };
    } catch (e) {
      return {
        used: 0,
        available: 5 * 1024 * 1024,
        percentage: 0
      };
    }
  }
}
