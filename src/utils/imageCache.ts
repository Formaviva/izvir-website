import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '../../.cache/social-images');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export interface CacheOptions {
    maxAge?: number; // in milliseconds
}

export const imageCache = {
    getPath(key: string): string {
        return path.join(CACHE_DIR, `${key}.png`);
    },

    exists(key: string, options: CacheOptions = {}): boolean {
        const cachePath = this.getPath(key);
        if (!fs.existsSync(cachePath)) return false;

        if (options.maxAge) {
            const stats = fs.statSync(cachePath);
            const age = Date.now() - stats.mtimeMs;
            if (age > options.maxAge) {
                fs.unlinkSync(cachePath);
                return false;
            }
        }

        return true;
    },

    get(key: string): Buffer | null {
        const cachePath = this.getPath(key);
        if (!fs.existsSync(cachePath)) return null;
        return fs.readFileSync(cachePath);
    },

    set(key: string, imageBuffer: Buffer): void {
        const cachePath = this.getPath(key);
        fs.writeFileSync(cachePath, imageBuffer);
    }
};
