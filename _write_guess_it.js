const fs = require('fs');
const path = require('path');
const base = path.join('D:' + String.fromCharCode(92) + 'Coding' + String.fromCharCode(92) + 'Projects' + String.fromCharCode(92) + 'REAL', 'src', 'app', 'api', 'guess-it-room');

function writeFile(relPath, content) {
  const fullPath = path.join(base, relPath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created:', relPath);
}
console.log('Script running...');
console.log('Base path:', base);
