/**
 * 修补 GUI 中异步加载 Blocks 的模块
 * 以解决 Tauri 的一个 BUG
 */

const path = require('path');
const fs = require('fs');
const lazyBlocksModulePath = require.resolve('clipcc-gui/src/lib/lazy-blocks.js');

const patchFilePath = path.join(__dirname, 'patches', 'lazy-blocks.js');

fs.copyFileSync(patchFilePath, lazyBlocksModulePath);
