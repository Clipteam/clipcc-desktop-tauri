import * as tauriFS from '@tauri-apps/api/fs';
import * as tauriPath from '@tauri-apps/api/path';
import * as path from 'path';

/**
 * Allow the storage module to load files bundled in the Electron application.
 */
class ElectronStorageHelper {
    parent: any;
    constructor (storageInstance: any) {
        this.parent = storageInstance;
    }

    /**
     * Fetch an asset but don't process dependencies.
     * @param {AssetType} assetType - The type of asset to fetch.
     * @param {string} assetId - The ID of the asset to fetch: a project ID, MD5, etc.
     * @param {DataFormat} dataFormat - The file format / file extension of the asset to fetch: PNG, JPG, etc.
     * @return {Promise.<Asset>} A promise for the contents of the asset.
     */
    async load (assetType: any, assetId: string, dataFormat: string): Promise<any> {
        assetId = path.basename(assetId);
        dataFormat = path.basename(dataFormat);
        const data = await tauriFS.readBinaryFile(`assets/${assetId}.${dataFormat}`, {
            dir: tauriPath.BaseDirectory.Resource
        });
        const bytes = new Uint8Array(data);
        return new this.parent.Asset(assetType, assetId, dataFormat, bytes);
    }

    static async loadAsBase64 (assetId: string, dataFormat: string) {
        assetId = path.basename(assetId);
        dataFormat = path.basename(dataFormat);
        const data = await tauriFS.readBinaryFile(`assets/${assetId}.${dataFormat}`, {
            dir: tauriPath.BaseDirectory.Resource
        });
        let mime = '';
        switch (dataFormat) {
        case 'png':
            mime = 'image/png';
            break;
        case 'jpg':
            mime = 'image/jpeg';
            break;
        case 'jpeg':
            mime = 'image/jpeg';
            break;
        case 'gif':
            mime = 'image/gif';
            break;
        case 'svg':
            mime = 'image/svg+xml';
            break;
        case 'mp3':
        case 'wav':
        case 'flac':
        case 'ogg':
            mime = 'audio';
            break;
        default:
        }
        return URL.createObjectURL(new Blob([new Uint8Array(data)], {type: mime}));
    }
}

// We assume that assets are static
const cache = new Map();
(window as any).onAssetPreview = async (assetId: string) => {
    if (cache.has(assetId)) {
        return cache.get(assetId);
    }
    const [splitedAssetId, dataFormat] = assetId.split('.');
    const data = await ElectronStorageHelper.loadAsBase64(splitedAssetId, dataFormat);
    cache.set(assetId, data);
    return data;
};

export default ElectronStorageHelper;
