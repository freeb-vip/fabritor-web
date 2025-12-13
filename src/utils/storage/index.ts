/**
 * 智能模板存储管理器
 * 自动检测并使用最佳存储方式
 * 优先级：FileSystem > IndexedDB > LocalStorage
 */

import { ITemplateStorage, Template } from './base';
import { FileSystemStorage } from './filesystem';
import { IndexedDBStorage } from './indexeddb';
import { LocalStorageStorage } from './localstorage';

class TemplateStorageManager {
  private storage: ITemplateStorage | null = null;
  private initialized = false;

  /**
   * 初始化存储管理器
   * 自动选择最佳存储方式
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // 尝试按优先级初始化存储
    const storages = [
      new FileSystemStorage(),
      new IndexedDBStorage(),
      new LocalStorageStorage()
    ];

    for (const storage of storages) {
      try {
        if (await storage.isSupported()) {
          await storage.init();
          this.storage = storage;
          console.log(`[Storage] Using ${storage.type} for template storage`);
          break;
        }
      } catch (e) {
        console.warn(`[Storage] ${storage.type} initialization failed:`, e);
      }
    }

    if (!this.storage) {
      throw new Error('No supported storage method available');
    }

    this.initialized = true;
  }

  /**
   * 获取当前使用的存储类型
   */
  getStorageType(): 'filesystem' | 'indexeddb' | 'localstorage' | null {
    return this.storage?.type || null;
  }

  /**
   * 获取所有模板
   */
  async getAllTemplates(): Promise<Template[]> {
    await this.ensureInitialized();
    return this.storage!.getAll();
  }

  /**
   * 保存模板
   */
  async saveTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.ensureInitialized();
    
    try {
      return await this.storage!.save(template);
    } catch (e) {
      // 如果是文件系统存储且用户取消选择目录，自动降级到 IndexedDB
      if (e instanceof Error && e.message === 'USER_CANCELLED_DIRECTORY_SELECTION') {
        console.log('[Storage] User cancelled directory selection, falling back to IndexedDB');
        
        // 降级到 IndexedDB
        const indexedDB = new IndexedDBStorage();
        if (await indexedDB.isSupported()) {
          await indexedDB.init();
          this.storage = indexedDB;
          console.log('[Storage] Switched to indexeddb storage');
          return await this.storage.save(template);
        }
        
        // 如果 IndexedDB 也不可用，降级到 localStorage
        const localStorage = new LocalStorageStorage();
        await localStorage.init();
        this.storage = localStorage;
        console.log('[Storage] Switched to localstorage storage');
        return await this.storage.save(template);
      }
      
      throw e;
    }
  }

  /**
   * 更新模板
   */
  async updateTemplate(id: string, updates: Partial<Template>): Promise<boolean> {
    await this.ensureInitialized();
    return this.storage!.update(id, updates);
  }

  /**
   * 删除模板
   */
  async deleteTemplate(id: string): Promise<boolean> {
    await this.ensureInitialized();
    return this.storage!.delete(id);
  }

  /**
   * 获取单个模板
   */
  async getTemplate(id: string): Promise<Template | null> {
    await this.ensureInitialized();
    return this.storage!.get(id);
  }

  /**
   * 清空所有模板
   */
  async clearAllTemplates(): Promise<boolean> {
    await this.ensureInitialized();
    return this.storage!.clear();
  }

  /**
   * 获取存储使用情况
   */
  async getStorageInfo(): Promise<{
    type: string;
    used: number;
    available: number;
    percentage: number;
    usedFormatted: string;
    availableFormatted: string;
  }> {
    await this.ensureInitialized();
    const info = await this.storage!.getStorageInfo();
    
    return {
      type: this.storage!.type,
      ...info,
      usedFormatted: this.formatBytes(info.used),
      availableFormatted: this.formatBytes(info.available)
    };
  }

  /**
   * 导出所有模板为文件
   */
  async exportTemplates(): Promise<void> {
    await this.ensureInitialized();
    return this.storage!.exportToFile();
  }

  /**
   * 从文件导入模板
   */
  async importTemplates(file: File): Promise<boolean> {
    await this.ensureInitialized();
    return this.storage!.importFromFile(file);
  }

  /**
   * 请求文件系统目录（仅 FileSystemStorage 可用）
   */
  async requestFileSystemDirectory(): Promise<boolean> {
    await this.ensureInitialized();
    
    if (this.storage instanceof FileSystemStorage) {
      return this.storage.requestDirectory();
    }
    
    return false;
  }

  /**
   * 获取文件系统目录名称（仅 FileSystemStorage 可用）
   */
  async getFileSystemDirectoryName(): Promise<string | null> {
    await this.ensureInitialized();
    
    if (this.storage instanceof FileSystemStorage) {
      return this.storage.getDirectoryName();
    }
    
    return null;
  }

  /**
   * 迁移数据到另一个存储方式
   */
  async migrateToStorage(targetType: 'filesystem' | 'indexeddb' | 'localstorage'): Promise<boolean> {
    await this.ensureInitialized();
    
    // 获取当前所有模板
    const templates = await this.getAllTemplates();
    
    // 创建新存储实例
    let newStorage: ITemplateStorage;
    
    switch (targetType) {
      case 'filesystem':
        newStorage = new FileSystemStorage();
        break;
      case 'indexeddb':
        newStorage = new IndexedDBStorage();
        break;
      case 'localstorage':
        newStorage = new LocalStorageStorage();
        break;
      default:
        return false;
    }
    
    // 检查是否支持
    if (!(await newStorage.isSupported())) {
      throw new Error(`${targetType} is not supported in this browser`);
    }
    
    // 初始化新存储
    await newStorage.init();
    
    // 迁移数据
    for (const template of templates) {
      await newStorage.save(template);
    }
    
    // 切换到新存储
    this.storage = newStorage;
    
    console.log(`[Storage] Migrated to ${targetType}`);
    return true;
  }

  // ===== 私有方法 =====

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (bytes === Number.MAX_SAFE_INTEGER) return '∞';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

// 导出单例实例
export const templateStorage = new TemplateStorageManager();

// 也导出类型供外部使用
export type { Template } from './base';
