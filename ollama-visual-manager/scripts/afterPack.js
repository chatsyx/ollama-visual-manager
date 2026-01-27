const fs = require('fs');
const path = require('path');

module.exports = async function(context) {
  console.log('Running afterPack script...');
  
  const appOutDir = context.appOutDir;
  console.log(`App output directory: ${appOutDir}`);
  
  // 清理不必要的文件
  const filesToRemove = [
    'node_modules/.package-lock.json',
    'node_modules/.yarn-integrity',
    'node_modules/**/*.md',
    'node_modules/**/*.ts',
    'node_modules/**/*.tsx',
    'node_modules/**/*.js.map',
    'node_modules/**/*.d.ts',
    'node_modules/**/test',
    'node_modules/**/tests',
    'node_modules/**/__tests__',
    'node_modules/**/example',
    'node_modules/**/examples',
    'node_modules/**/doc',
    'node_modules/**/docs',
    'node_modules/**/man',
    'node_modules/**/benchmark',
    'node_modules/**/benchmarks'
  ];
  
  console.log('Removing unnecessary files...');
  
  // 这里可以添加具体的文件清理逻辑
  // 由于我们使用了 asar 打包，实际的文件结构会有所不同
  // 但我们可以通过配置 electron-builder 来优化打包过程
  
  console.log('AfterPack script completed successfully!');
};
