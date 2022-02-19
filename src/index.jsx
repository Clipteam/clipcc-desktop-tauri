import React from 'react';
import ReactDOM from 'react-dom';
import * as tauri from '@tauri-apps/api';
import GUI from './app.jsx';
import { setIsScratchDesktop } from 'clipcc-gui/src/lib/isScratchDesktop';

setIsScratchDesktop(true);

tauri.window.appWindow.listen('tauri://close-requested', () => {
    if (confirm('Do you want to close the app?')) {
        tauri.window.appWindow.close();
    }
});

window.ClipCC = {
    ipc: {
        async send (typeName, ...args) {
            console.log(`[ipc] ${typeName}`, ...args);
            switch (typeName) {
            case 'open-extension-store':
                for (const win of tauri.window.getAll()) {
                    if (win.label === 'extension-store') {
                        await win.setFocus();
                        return;
                    }
                }
                new tauri.window.WebviewWindow('extension-store', {
                    url: 'https://codingclip.com/extension',
                    width: 800,
                    height: 510,
                    title: 'Extension Store',
                })
                break;
            default:
                break;
            }
        }
    }
};

window.require = function (moduleName) {
    if (moduleName in tauri) {
        return tauri[moduleName];
    }
    if (moduleName === 'tauri') {
        return tauri;
    }
    throw new TypeError(`Cannot find module '${moduleName}'`);
};

ReactDOM.render(GUI, document.getElementById('app'));
