const fs = require('fs');
const path = require('path');

const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};

console.log('🔄 Restoring Assets for Standalone Build...');

const standaloneDir = path.join(__dirname, '.next', 'standalone');
const staticSrc = path.join(__dirname, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
const publicSrc = path.join(__dirname, 'public');
const publicDest = path.join(standaloneDir, 'public');

try {
    // 1. Copy Static (.next/static -> .next/standalone/.next/static)
    if (fs.existsSync(staticSrc)) {
        console.log('  -> Copying .next/static...');
        copyRecursiveSync(staticSrc, staticDest);
    } else {
        console.warn('  ⚠️ .next/static not found!');
    }

    // 2. Copy Public (public -> .next/standalone/public)
    if (fs.existsSync(publicSrc)) {
        console.log('  -> Copying public folder...');
        copyRecursiveSync(publicSrc, publicDest);
    } else {
        console.warn('  ⚠️ Public folder not found!');
    }

    console.log('✅ Assets Restored Successfully!');
} catch (error) {
    console.error('❌ Error restoring assets:', error);
    process.exit(1);
}
