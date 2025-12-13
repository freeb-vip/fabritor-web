/**
 * 模板存储策略 - 统一接口
 * 支持多种存储方式的抽象基类
 */

export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  json: any;
  createdAt: number;
  updatedAt: number;
}

/**
 * 存储策略接口
 * 所有存储实现必须遵循此接口
 */
export interface ITemplateStorage {
  // 存储类型标识
  readonly type: 'filesystem' | 'indexeddb' | 'localstorage';
  
  // 初始化存储
  init(): Promise<void>;
  
  // 获取所有模板
  getAll(): Promise<Template[]>;
  
  // 保存模板
  save(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  
  // 更新模板
  update(id: string, updates: Partial<Template>): Promise<boolean>;
  
  // 删除模板
  delete(id: string): Promise<boolean>;
  
  // 获取单个模板
  get(id: string): Promise<Template | null>;
  
  // 清空所有模板
  clear(): Promise<boolean>;
  
  // 检查是否支持此存储方式
  isSupported(): Promise<boolean>;
  
  // 获取存储使用情况
  getStorageInfo(): Promise<{
    used: number;      // 已使用字节数
    available: number; // 可用字节数
    percentage: number; // 使用百分比
  }>;
  
  // 导出模板为文件
  exportToFile(): Promise<void>;
  
  // 从文件导入模板
  importFromFile(file: File): Promise<boolean>;
}

/**
 * 存储基类 - 提供通用方法
 */
export abstract class BaseTemplateStorage implements ITemplateStorage {
  abstract readonly type: 'filesystem' | 'indexeddb' | 'localstorage';
  
  abstract init(): Promise<void>;
  abstract getAll(): Promise<Template[]>;
  abstract save(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  abstract update(id: string, updates: Partial<Template>): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
  abstract get(id: string): Promise<Template | null>;
  abstract clear(): Promise<boolean>;
  abstract isSupported(): Promise<boolean>;
  abstract getStorageInfo(): Promise<{ used: number; available: number; percentage: number }>;
  
  /**
   * 生成唯一ID
   */
  protected generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 创建完整的模板对象
   */
  protected createTemplate(data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template {
    return {
      ...data,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
  
  /**
   * 导出模板为JSON文件
   */
  async exportToFile(): Promise<void> {
    const templates = await this.getAll();
    const dataStr = JSON.stringify(templates, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `fabritor_templates_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * 从JSON文件导入模板
   */
  async importFromFile(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const templates = JSON.parse(e.target?.result as string);
          if (!Array.isArray(templates)) {
            reject(new Error('Invalid template file format'));
            return;
          }
          
          // 导入每个模板
          for (const template of templates) {
            await this.save(template);
          }
          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}
