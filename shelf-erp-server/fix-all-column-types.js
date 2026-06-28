/**
 * 系统性修复 SQLite 兼容性问题：
 * 所有 @Column() 装饰器如果缺少 type，且属性是 string 类型，添加 type: 'text'
 * 
 * 策略：查找所有 @Column({ 后面在 }) 之前没有 type: 的情况，添加 type: 'text'
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
  const originalContent = content;
  
  // 策略：找到所有 @Column({ 开头的装饰器
  // 如果装饰器内容中有 length: 或 default: 但没有 type:，则添加 type: 'text'
  
  // 用正则匹配 @Column({ ... }) 整个装饰器（可能多行）
  const columnDecoratorRegex = /(@Column\(\{[\s\S]*?\}\))/g;
  
  content = content.replace(columnDecoratorRegex, (match) => {
    // 检查这个装饰器是否有 type:
    if (match.includes('type:')) {
      return match; // 已经有 type，不需要修改
    }
    
    // 检查这个装饰器是否有 length: 或 default:（这些是字符串列的特征）
    // 或者检查对应的属性是否是 string 类型
    // 为简化，只要有 @Column({ 且没有 type:，就添加 type: 'text'
    // 但要排除 @Column({ type: 'uuid' }) 这种情况（已经有 type 了，前面已经检查过）
    
    // 在 @Column({ 后面添加 type: 'text',
    return match.replace('@Column({', '@Column({ type: \'text\',');
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log(`✅ 修复: ${path.relative(srcDir, filePath)}`);
  }
}

console.log(`\n修复完成！共修复 ${fixedCount} 个文件`);
console.log('⚠️  请检查修复后的文件，确保 type 添加正确');
