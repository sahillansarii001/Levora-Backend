import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'EACCES') {
        console.log(`Skipping: ${dirFile}`);
      } else {
        throw err;
      }
    }
  });
  return filelist;
};

const files = walkSync('./src');

files.forEach(file => {
  if (file.endsWith('.js')) {
    let content = fs.readFileSync(file, 'utf8');

    // Basic require replacements
    // const x = require('y') -> import x from 'y'
    content = content.replace(/const\s+([A-Za-z0-9_]+)\s*=\s*require\(['"]([^'"]+)['"]\);/g, "import $1 from '$2.js';");
    
    // const { x, y } = require('z') -> import { x, y } from 'z'
    content = content.replace(/const\s+\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\);/g, "import { $1 } from '$2.js';");

    // Replace built-in node modules to avoid .js extension
    content = content.replace(/from '([^.\/][^'"]+)\.js'/g, "from '$1'");

    // Export replacements
    content = content.replace(/module\.exports\s*=\s*([A-Za-z0-9_]+);/g, "export default $1;");
    content = content.replace(/exports\.([A-Za-z0-9_]+)\s*=\s*/g, "export const $1 = ");

    // Clean up .js.js if it happened
    content = content.replace(/\.js\.js'/g, ".js'");

    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log("Basic ES Module conversion done.");
