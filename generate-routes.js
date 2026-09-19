import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    try {
      if (fs.statSync(dirPath).isDirectory()) {
        walkDir(dirPath, callback);
      } else if (f === 'route.ts') {
        callback(dirPath);
      }
    } catch (e) {
      // Ignore inaccessible files/directories
    }
  });
}

let imports = '';
let routes = 'const apiRoutes = {};\n';
let i = 0;

walkDir('./src/app/api', (filepath) => {
  const normalizedFilepath = path.resolve(filepath);
  const baseDir = path.resolve('./src/app');
  const relativePath = path.relative(baseDir, path.dirname(filepath));
  
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return;
  }

  const routeUrl = '/' + relativePath.replace(/\\/g, '/');
  
  const srcBaseDir = path.resolve('src');
  const relativeSrcPath = path.relative(srcBaseDir, normalizedFilepath);
  if (relativeSrcPath.startsWith('..') || path.isAbsolute(relativeSrcPath)) {
    return;
  }

  const importPath = './' + relativeSrcPath.replace(/\\/g, '/');
  imports += `import * as route${i} from '${importPath}';\n`;
  routes += `apiRoutes['${routeUrl}'] = route${i};\n`;
  i++;
});

console.log(imports + '\n' + routes + '\nexport { apiRoutes };');