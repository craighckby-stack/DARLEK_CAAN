import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else if (f === 'route.ts') {
      callback(dirPath);
    }
  });
}

let imports = '';
let routes = 'const apiRoutes = {};\n';
let i = 0;

walkDir('./src/app/api', (filepath) => {
  const routeUrl = '/' + path.relative('./src/app', path.dirname(filepath)).replace(/\\/g, '/');
  // filepath is like src/app/api/... 
  // since api-routes.ts is in src/, the import path should be ./app/api/...
  const importPath = './' + path.relative('src', filepath).replace(/\\/g, '/');
  imports += `import * as route${i} from '${importPath}';\n`;
  routes += `apiRoutes['${routeUrl}'] = route${i};\n`;
  i++;
});

console.log(imports + '\n' + routes + '\nexport { apiRoutes };');
