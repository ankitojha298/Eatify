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
        let newContent = content.replace(/text-orange-/g, 'text-brand-')
            .replace(/bg-orange-/g, 'bg-brand-')
            .replace(/border-orange-/g, 'border-brand-')
            .replace(/ring-orange-/g, 'ring-brand-')
            .replace(/focus:border-orange-/g, 'focus:border-brand-')
            .replace(/focus:ring-orange-/g, 'focus:ring-brand-')
            .replace(/hover:text-orange-/g, 'hover:text-brand-')
            .replace(/hover:bg-orange-/g, 'hover:bg-brand-');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log(`Updated ${filePath}`);
        }
    }
});
console.log('Finished updating colors.');
