export interface IStorageService {
    upload(file: File, path: string): Promise<string>;
    delete(path: string): Promise<boolean>;
}

export class R2Storage implements IStorageService {
    private bucket: R2Bucket;
    private publicBaseUrl: string; // e.g., https://pub-xxx.r2.dev or custom domain

    constructor(bucket: R2Bucket, publicBaseUrl: string = "https://zestest.com/cdn") {
        this.bucket = bucket;
        this.publicBaseUrl = publicBaseUrl;
    }

    async upload(file: File, path: string): Promise<string> {
        console.log(`📤 [R2] Đang upload file ${path}...`);
        try {
            await this.bucket.put(path, file, {
                httpMetadata: { contentType: file.type || 'application/zip' }
            });
            console.log(`✅ [R2] Upload thành công: ${path}`);
            return `${this.publicBaseUrl}/${path}`;
        } catch (error) {
            console.error(`❌ [R2] Upload lỗi:`, error);
            throw error;
        }
    }

    async delete(path: string): Promise<boolean> {
        console.log(`🗑️ [R2] Đang xóa file ${path}...`);
        try {
            await this.bucket.delete(path);
            console.log(`✅ [R2] Xóa thành công: ${path}`);
            return true;
        } catch (error) {
            console.error(`❌ [R2] Xóa lỗi:`, error);
            return false;
        }
    }
}


