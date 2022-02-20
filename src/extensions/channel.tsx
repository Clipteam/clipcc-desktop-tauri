import {ClipCCPlugin} from './plugin';

const channel = new BroadcastChannel('extension');
const installTasks = new Set<[string, Function]>();
const listTasks = new Set<Function>();

channel.addEventListener('message', event => {
    const {action, extensionId, data, err: _err} = event.data;
    if (action === 'addSuccess') {
        for (const task of installTasks.values()) {
            if (task[0] === extensionId) {
                task[1](true);
                installTasks.delete(task);
            }
        }
    } else if (action === 'addFail') {
        for (const task of installTasks.values()) {
            if (task[0] === extensionId) {
                task[1](false);
                installTasks.delete(task);
            }
        }
    } else if (action === 'tell') {
        for (const task of listTasks.values()) {
            task(data);
        }
        listTasks.clear();
    } else {
        console.warn('Unknown action', action);
    }
});

export const installExtension = (plugin: ClipCCPlugin): Promise<boolean> => new Promise(resolve => {
    installTasks.add([plugin.id, resolve]);
    channel.postMessage({
        action: 'add',
        download: plugin.download,
        extension: plugin.id
    });
});

export const getInstalledExtensions = (): Promise<string[]> => new Promise(resolve => {
    listTasks.add(resolve);
    channel.postMessage({
        action: 'get'
    });
});
