/**
 * File System Access API 存储实现
 * 使用真实的文件系统存储模板
 * 仅支持 Chrome 86+, Edge 86+
 */

import { BaseTemplateStorage, Template } from './base';

const DB_NAME = 'fabritor_filesystem_config';
const DB_VERSION = 1;
const STORE_NAME = 'settings';

export class FileSystemStorage extends BaseTemplateStorage {
  readonly type = 'filesystem' as const;
  private dirHandle: FileSystemDirectoryHandle | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // 尝试从 IndexedDB 恢复已授权的目录句柄
      this.dirHandle = await this.loadDirectoryHandle();
      
      if (this.dirHandle) {
        // 验证权限是否仍然有效
        const permission = await this.dirHandle.queryPermission({ mode: 'readwrite' });
        if (permission !== 'granted') {
          const requestPermission = await this.dirHandle.requestPermission({ mode: 'readwrite' });
          if (requestPermission !== 'granted') {
            this.dirHandle = null;
          }
        }
      }
      
      this.initialized = true;
    } catch (e) {
      console.error('FileSystemStorage init failed:', e);
      this.dirHandle = null;
      this.initialized = true;
    }
  }

  async isSupported(): Promise<boolean> {
    return 'showDirectoryPicker' in window;
  }

  /**
   * 请求用户选择存储目录
   */
  async requestDirectory(): Promise<boolean> {
    try {
      // @ts-ignore
      this.dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });
      
      await this.saveDirectoryHandle(this.dirHandle);
      return true;
    } catch (e) {
      console.error('User cancelled directory selection:', e);
      return false;
    }
  }

  async getAll(): Promise<Template[]> {
    if (!this.dirHandle) {
      const hasDir = await this.requestDirectory();
      if (!hasDir) return [];
    }

    const templates: Template[] = [];
    
    try {
      // @ts-ignore
      for await (const entry of this.dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          try {
            const file = await entry.getFile();
            const content = await file.text();
            const template = JSON.parse(content);
            templates.push(template);
          } catch (e) {
            console.error(`Failed to read template file ${entry.name}:`, e);
          }
        }
      }
    } catch (e) {
      console.error('Failed to read directory:', e);
    }
    
    // 按创建时间倒序排序
    return templates.sort((a, b) => b.createdAt - a.createdAt);
  }

  async save(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // 如果没有目录，自动请求用户选择
    if (!this.dirHandle) {
      const hasDir = await this.requestDirectory();
      if (!hasDir) {
        // 用户取消选择，抛出特殊错误以便上层处理
        throw new Error('USER_CANCELLED_DIRECTORY_SELECTION');
      }
    }

    const newTemplate = this.createTemplate(template);
    const fileName = this.getFileName(newTemplate.id, newTemplate.name);
    
    try {
      const fileHandle = await this.dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(newTemplate, null, 2));
      await writable.close();
      
      return newTemplate.id;
    } catch (e) {
      console.error('Failed to save template:', e);
      throw e;
    }
  }

  async update(id: string, updates: Partial<Template>): Promise<boolean> {
    const template = await this.get(id);
    if (!template) return false;
    
    const updated = {
      ...template,
      ...updates,
      updatedAt: Date.now()
    };
    
    // 删除旧文件
    await this.deleteFile(id, template.name);
    
    // 保存新文件
    const fileName = this.getFileName(updated.id, updated.name);
    
    try {
      const fileHandle = await this.dirHandle!.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(updated, null, 2));
      await writable.close();
      
      return true;
    } catch (e) {
      console.error('Failed to update template:', e);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    const templates = await this.getAll();
    const template = templates.find(t => t.id === id);
    
    if (!template) return false;
    
    return this.deleteFile(id, template.name);
  }

  async get(id: string): Promise<Template | null> {
    const templates = await this.getAll();
    return templates.find(t => t.id === id) || null;
  }

  async clear(): Promise<boolean> {
    if (!this.dirHandle) return false;
    
    try {
      // @ts-ignore
      for await (const entry of this.dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          await this.dirHandle.removeEntry(entry.name);
        }
      }
      return true;
    } catch (e) {
      console.error('Failed to clear templates:', e);
      return false;
    }
  }

  async getStorageInfo(): Promise<{ used: number; available: number; percentage: number }> {
    // File System Access API 没有限制，返回近似值
    if ('navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || Number.MAX_SAFE_INTEGER,
        percentage: estimate.usage && estimate.quota 
          ? (estimate.usage / estimate.quota) * 100 
          : 0
      };
    }
    
    return {
      used: 0,
      available: Number.MAX_SAFE_INTEGER,
      percentage: 0
    };
  }

  /**
   * 获取当前选择的目录路径（仅用于显示）
   */
  async getDirectoryName(): Promise<string | null> {
    return this.dirHandle?.name || null;
  }

  // ===== 私有方法 =====

  private getFileName(id: string, name: string): string {
    // 移除文件名中的非法字符
    const safeName = name.replace(/[<>:"/\\|?*]/g, '_');
    return `${safeName}_${id}.json`;
  }

  private async deleteFile(id: string, name: string): Promise<boolean> {
    if (!this.dirHandle) return false;
    
    const fileName = this.getFileName(id, name);
    
    try {
      await this.dirHandle.removeEntry(fileName);
      return true;
    } catch (e) {
      console.error('Failed to delete file:', e);
      return false;
    }
  }

  private async saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ key: 'directoryHandle', handle });
        
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async loadDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getRequest = store.get('directoryHandle');
        
        getRequest.onsuccess = () => {
          db.close();
          resolve(getRequest.result?.handle || null);
        };
        
        getRequest.onerror = () => {
          db.close();
          resolve(null);
        };
      };
      
      request.onerror = () => resolve(null);
    });
  }
}
