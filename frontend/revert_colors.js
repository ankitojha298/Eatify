import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src', function (filePath) {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let newContent = content.replace(/text-brand-/g, 'text-orange-')
            .replace(/bg-brand-/g, 'bg-orange-')
            .replace(/border-brand-/g, 'border-orange-')
            .replace(/ring-brand-/g, 'ring-orange-')
            .replace(/focus:border-brand-/g, 'focus:border-orange-')
            .replace(/focus:ring-brand-/g, 'focus:ring-orange-')
            .replace(/hover:text-brand-/g, 'hover:text-orange-')
            .replace(/hover:bg-brand-/g, 'hover:bg-orange-');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log(`Reverted ${filePath}`);
        }
    }
});
console.log('Finished reverting colors.');
