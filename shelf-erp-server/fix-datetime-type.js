/**
 * 修复 SQLite 兼容性问题：
 * 1. @CreateDateColumn / @UpdateDateColumn 中移除 type: 'datetime'
 * 2. @Column({ type: 'datetime' }) 改为 type: 'text'
 * 3. 移除 default: () => 'NOW()'（SQLite 不支持）
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const entityFiles = [];

function findEntityFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findEntityFiles(fullPath);
    } else if (file.endsWith('.entity.ts')) {
      entityFiles.push(fullPath);
    }
  }
}

findEntityFiles(srcDir);

console.log(`找到 ${entityFiles.length} 个实体文件`);

let fixedCount = 0;

for (const filePath of entityFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. 修复 @CreateDateColumn({ ..., type: 'datetime', ... })
  //    移除 type: 'datetime' 行
  const createDatePattern = /(@CreateDateColumn\(\{[\s\S]*?)type:\s*'datetime',?\s*\n?([\s\S]*?\}\))/g;
  if (content.match(createDatePattern)) {
    content = content.replace(createDatePattern, (match, before, after) => {
      // 移除 type: 'datetime' 行
      const fixed = match.replace(/type:\s*'datetime',?\s*\n?/g, '');
      return fixed;
    });
    modified = true;
  }

  // 2. 修复 @UpdateDateColumn({ ..., type: 'datetime', ... })
  const updateDatePattern = /(@UpdateDateColumn\(\{[\s\S]*?)type:\s*'datetime',?\s*\n?([\s\S]*?\}\))/g;
  if (content.match(updateDatePattern)) {
    content = content.replace(updateDatePattern, (match, before, after) => {
      const fixed = match.replace(/type:\s*'datetime',?\s*\n?/g, '');
      return fixed;
    });
    modified = true;
  }

  // 3. 修复 @Column({ ..., type: 'datetime', ... }) → type: 'text'
  const columnPattern = /(@Column\(\{[\s\S]*?)type:\s*'datetime'([\s\S]*?\}\))/g;
  if (content.match(columnPattern)) {
    content = content.replace(columnPattern, (match, before, after) => {
      const fixed = match.replace(/type:\s*'datetime'/g, "type: 'text'");
      return fixed;
    });
    modified = true;
  }

  // 4. 移除 default: () => 'NOW()'（SQLite 不支持）
  if (content.includes("() => 'NOW()'")) {
    content = content.replace(/default:\s*\(\?\)\s*'NOW\(\)',?\s*\n?/g, '');
    // 如果移除后导致对象末尾有 trailing comma 问题，需要清理
    // 但 TypeScript 允许 trailing comma，所以不用处理
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log(`✅ 修复: ${path.relative(srcDir, filePath)}`);
  }
}

console.log(`\n修复完成！共修复 ${fixedCount} 个文件`);
