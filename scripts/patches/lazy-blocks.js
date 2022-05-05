import blocks from './blocks.js';
import ClipCCBlock from 'clipcc-block';

/* eslint-disable linebreak-style */
// 异步加载 clipcc-block
let BlocksComponent = null;

const loaded = () => !!BlocksComponent;

const get = () => {
    if (!loaded()) return Error('blocks not loaded');
    return BlocksComponent;
};

const load = (vm, callback) => {
    if (BlocksComponent) return Promise.resolve(BlocksComponent);
    BlocksComponent = ClipCCBlock;
    callback(blocks(vm));
    return Promise.resolve(BlocksComponent);
};

export default {
    get,
    load,
    loaded
};
