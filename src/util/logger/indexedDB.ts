// IndexedDB operations helper
export class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private storeName: string;

  constructor(dbName: string, storeName: string) {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
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
  }

  async add(logs: any[], sessionId: string): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      logs.forEach(log => {
        store.add({ ...log, sessionId });
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
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
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(limit: number): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
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
    });
  }

  async deleteOldLogs(maxLogs: number, currentMinute: Date): Promise<number> {
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
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
    });
  }

  async clear(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  get isReady(): boolean {
    return this.db !== null;
  }
}

