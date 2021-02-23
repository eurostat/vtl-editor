import { StoredItemTransfer } from './storedItemTransfer';

export interface FolderContentTransfer {
    folders: StoredItemTransfer[];
    files: StoredItemTransfer[];
}