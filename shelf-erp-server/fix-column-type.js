/**
 * 修复 SQLite 兼容性问题：
 * 查找所有 @Column({ length: ..., ... }) 但没有 type 的装饰器
 * 添加 type: 'text'
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
  
  // 查找 @Column({ ... length: ... }) 但没有 type 的情况
  // 匹配 @Column({ 之后，在遇到的第一个 } 之前，有 length 但没有 type
  const columnPattern = /@Column\(\{([\s\S]*?)\}\)/g;
  let match;
  
  while ((match = columnPattern.exec(content)) !== null) {
    const decoratorBody = match[1];
    
    // 检查是否有 length 但没有 type
    if (decoratorBody.includes('length:') && !decoratorBody.includes('type:')) {
      // 需要添加 type: 'text'
      // 在 @Column({ 之后添加 type: 'text',
      const fullMatch = match[0];
      const replacement = fullMatch.replace('@Column({', '@Column({ type: \'text\',');
      
      // 因为我们在循环中修改 content，需要小心处理
      // 让我们用不同的方法：收集所有需要替换的位置，然后统一替换
      // 但实际上我们可以先替换，然后重新执行（因为文件数量不多）
    }
  }
  
  // 更简单的方法：直接查找并替换 @Column({ length: 为 @Column({ type: 'text', length:
  const simplePattern = /@Column\(\{\s*length:/g;
  if (content.match(simplePattern)) {
    // 检查是否已经有权限 type
    const lines = content.split('\n');
    let newLines = [];
    let inColumnDecorator = false;
    let decoratorHasType = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('@Column({')) {
        inColumnDecorator = true;
        decoratorHasType = false;
      }
      
      if (inColumnDecorator && line.includes('type:')) {
        decoratorHasType = true;
      }
      
      if (inColumnDecorator && line.includes('length:') && !decoratorHasType) {
        // 需要添加 type: 'text'
        // 在 @Column({ 之后插入 type: 'text',
        const indent = line.match(/^(\s*)/)[1];
        // 找到 @Column({ 所在行
        for (let j = i; j >= 0; j--) {
          if (newLines[j] && newLines[j].includes('@Column({')) {
            // 在这里插入
            newLines[j] = newLines[j].replace('@Column({', '@Column({ type: \'text\',');
            break;
          }
        }
      }
      
      if (inColumnDecorator && line.includes('})')) {
        inColumnDecorator = false;
      }
      
      newLines.push(line);
    }
    
    content = newLines.join('\n');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log(`✅ 修复: ${path.relative(srcDir, filePath)}`);
  }
}

console.log(`\n修复完成！共修复 ${fixedCount} 个文件`);
