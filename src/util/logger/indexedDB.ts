// IndexedDB operations helper
export class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private storeName: string;
  private initPromise: Promise<void> | null = null;

  constructor(dbName: string, storeName: string) {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private checkConnection(): boolean {
    if (!this.db) return false;
    
    try {
      void this.db.objectStoreNames;
      return true;
    } catch {
      this.db = null;
      return false;
    }
  }

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.checkConnection()) {
      return Promise.resolve();
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        this.initPromise = null;
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        
        this.db.onclose = () => {
          console.warn('[IndexedDB] Connection closed, will reconnect on next operation');
          this.db = null;
        };
        
        this.db.onerror = (event) => {
          console.error('[IndexedDB] Database error:', event);
        };
        
        this.initPromise = null;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('category', 'category', { unique: false });
          objectStore.createIndex('level', 'level', { unique: false });
          objectStore.createIndex('sessionId', 'sessionId', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  private async ensureConnection(): Promise<void> {
    if (!this.checkConnection()) {
      await this.init();
    }
  }

  async add(logs: any[], sessionId: string): Promise<void> {
    await this.ensureConnection();
    
    if (!this.db) {
      throw new Error('IndexedDB not initialized after reconnection attempt');
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        logs.forEach(log => {
          store.add({ ...log, sessionId });
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => {
          const error = (event.target as IDBTransaction).error;
          if (error && (error.name === 'QuotaExceededError' || error.name === 'UnknownError')) {
            console.warn('[IndexedDB] Quota exceeded or connection error, attempting reconnection');
            this.db = null;
            this.ensureConnection().then(() => {
              this.add(logs, sessionId).then(resolve).catch(reject);
            }).catch(reject);
            return;
          }
          reject(error);
        };
      } catch (error) {
        if (!this.checkConnection()) {
          console.warn('[IndexedDB] Connection lost during add, attempting reconnection');
          this.ensureConnection().then(() => {
            this.add(logs, sessionId).then(resolve).catch(reject);
          }).catch(reject);
        } else {
          reject(error);
        }
      }
    });
  }

  async getLogsForMinute(minuteDate: Date): Promise<any[]> {
    if (!this.db) return [];

    const startOfMinute = new Date(minuteDate);
    startOfMinute.setSeconds(0, 0);
    startOfMinute.setMilliseconds(0);
    const endOfMinute = new Date(minuteDate);
    endOfMinute.setSeconds(59, 999);
    endOfMinute.setMilliseconds(999);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const range = IDBKeyRange.bound(
        startOfMinute.toISOString(),
        endOfMinute.toISOString()
      );
      const request = index.getAll(range);

      request.onsuccess = () => {
        const logs = request.result.map((logData: any) => {
          const { id, sessionId, ...log } = logData;
          return log;
        });
        resolve(logs);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteLogsForMinute(minuteDate: Date): Promise<number> {
    if (!this.db) return 0;

    const startOfMinute = new Date(minuteDate);
    startOfMinute.setSeconds(0, 0);
    startOfMinute.setMilliseconds(0);
    const endOfMinute = new Date(minuteDate);
    endOfMinute.setSeconds(59, 999);
    endOfMinute.setMilliseconds(999);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const range = IDBKeyRange.bound(
        startOfMinute.toISOString(),
        endOfMinute.toISOString()
      );
      const request = index.openCursor(range);

      let deleted = 0;
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          resolve(deleted);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async count(): Promise<number> {
    await this.ensureConnection();
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        if (!this.checkConnection()) {
          this.ensureConnection().then(() => this.count().then(resolve).catch(reject)).catch(reject);
        } else {
          reject(error);
        }
      }
    });
  }

  async getAll(limit: number): Promise<any[]> {
    await this.ensureConnection();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev');

        const logs: any[] = [];
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor && logs.length < limit) {
            const logData = cursor.value;
            const { id, sessionId, ...log } = logData;
            logs.push(log);
            cursor.continue();
          } else {
            resolve(logs);
          }
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        if (!this.checkConnection()) {
          this.ensureConnection().then(() => this.getAll(limit).then(resolve).catch(reject)).catch(reject);
        } else {
          reject(error);
        }
      }
    });
  }

  async deleteOldLogs(maxLogs: number, currentMinute: Date): Promise<number> {
    await this.ensureConnection();
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      try {
        const countTransaction = this.db!.transaction([this.storeName], 'readonly');
        const countStore = countTransaction.objectStore(this.storeName);
        const countRequest = countStore.count();

        countRequest.onsuccess = () => {
          const totalCount = countRequest.result;
          if (totalCount <= maxLogs) {
            resolve(0);
            return;
          }

          const deleteCount = totalCount - maxLogs;
          const transaction = this.db!.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const index = store.index('timestamp');
          const request = index.openCursor(null, 'next');

          let deleted = 0;
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor && deleted < deleteCount) {
              const logDate = new Date(cursor.value.timestamp);
              if (logDate < currentMinute) {
                cursor.delete();
                deleted++;
              }
              cursor.continue();
            } else {
              resolve(deleted);
            }
          };
          request.onerror = () => reject(request.error);
        };
        countRequest.onerror = () => reject(countRequest.error);
      } catch (error) {
        if (!this.checkConnection()) {
          this.ensureConnection().then(() => this.deleteOldLogs(maxLogs, currentMinute).then(resolve).catch(reject)).catch(reject);
        } else {
          reject(error);
        }
      }
    });
  }

  async clear(): Promise<void> {
    await this.ensureConnection();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        if (!this.checkConnection()) {
          this.ensureConnection().then(() => this.clear().then(resolve).catch(reject)).catch(reject);
        } else {
          reject(error);
        }
      }
    });
  }

  get isReady(): boolean {
    return this.checkConnection();
  }
}

