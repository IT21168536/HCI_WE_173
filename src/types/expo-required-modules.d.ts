declare module 'expo-secure-store' {
  export function setItemAsync(key: string, value: string): Promise<void>;
  export function getItemAsync(key: string): Promise<string | null>;
  export function deleteItemAsync(key: string): Promise<void>;
}

declare module 'expo-sqlite' {
  export type SQLiteRunResult = {
    lastInsertRowId: number;
    changes: number;
  };

  export type SQLiteDatabase = {
    execAsync(source: string): Promise<void>;
    runAsync(source: string, params?: unknown[]): Promise<SQLiteRunResult>;
    getFirstAsync<T = unknown>(source: string, params?: unknown[]): Promise<T | null>;
    getAllAsync<T = unknown>(source: string, params?: unknown[]): Promise<T[]>;
    withTransactionAsync(task: () => Promise<void>): Promise<void>;
  };

  export function openDatabaseAsync(name: string): Promise<SQLiteDatabase>;
}

declare module 'expo-image-picker' {
  export enum MediaTypeOptions {
    Images = 'Images',
  }

  export type ImagePickerAsset = {
    uri: string;
  };

  export type ImagePickerResult =
    | { canceled: true; assets: null }
    | { canceled: false; assets: ImagePickerAsset[] };

  export function requestMediaLibraryPermissionsAsync(): Promise<{ granted: boolean }>;
  export function launchImageLibraryAsync(options: {
    allowsEditing?: boolean;
    mediaTypes?: MediaTypeOptions;
    quality?: number;
  }): Promise<ImagePickerResult>;
}
