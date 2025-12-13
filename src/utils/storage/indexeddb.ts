/**
 * IndexedDB 存储实现
 * 大容量存储（通常 >50MB）
 * 支持所有现代浏览器
 */

import { BaseTemplateStorage, Template } from './base';

const DB_NAME = 'fabritor_templates_db';
const DB_VERSION = 1;
const STORE_NAME = 'templates';

export class IndexedDBStorage extends BaseTemplateStorage {
  readonly type = 'indexeddb' as const;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    
    this.db = await this.openDatabase();
  }

  async isSupported(): Promise<boolean> {
    return 'indexedDB' in window;
  }

  async getAll(): Promise<Template[]> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const templates = request.result as Template[];
        // 按创建时间倒序排序
        resolve(templates.sort((a, b) => b.createdAt - a.createdAt));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async save(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.init();
    
    const newTemplate = this.createTemplate(template);
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(newTemplate);
      
      request.onsuccess = () => resolve(newTemplate.id);
      request.onerror = () => reject(request.error);
    });
  }

  async update(id: string, updates: Partial<Template>): Promise<boolean> {
    await this.init();
    
    const template = await this.get(id);
    if (!template) return false;
    
    const updated = {
      ...template,
      ...updates,
      updatedAt: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(updated);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string): Promise<boolean> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async get(id: string): Promise<Template | null> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<boolean> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageInfo(): Promise<{ used: number; available: number; percentage: number }> {
    if ('navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 50 * 1024 * 1024, // 默认 50MB
        percentage: estimate.usage && estimate.quota 
          ? (estimate.usage / estimate.quota) * 100 
          : 0
      };
    }
    
    return {
      used: 0,
      available: 50 * 1024 * 1024,
      percentage: 0
    };
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('name', 'name', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
