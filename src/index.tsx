import * as ReactDOM from 'react-dom';
import * as tauri from '@tauri-apps/api';
import GUI from './app';
import {setIsScratchDesktop} from 'clipcc-gui/src/lib/isScratchDesktop';

setIsScratchDesktop(true);

tauri.window.appWindow.listen('tauri://close-requested', () => {
    // eslint-disable-next-line no-alert
    if (confirm('Do you want to close the app?')) {
        tauri.window.appWindow.close();
    }
});

(window as any).ClipCC = {
    ipc: {
        async send (typeName: any) {
            switch (typeName) {
            case 'open-extension-store':
            {
                for (const win of tauri.window.getAll()) {
                    if (win.label === 'extension-store') {
                        await win.setFocus();
                        return;
                    }
                }
                const newUri = new URL(location.href);
                newUri.pathname = newUri.pathname.replace(/\/[^/]+$/, '/extensions.html');
                // eslint-disable-next-line no-new
                new tauri.window.WebviewWindow('extension-store', {
                    url: 'extensions.html',
                    width: 800,
                    height: 510,
                    title: 'Extension Store'
                });
                break;
            }
            default:
                break;
            }
        }
    }
};

(window as any).require = function (moduleName: keyof typeof tauri) {
    if (moduleName in tauri) {
        return tauri[moduleName];
    }
    if (moduleName === 'tauri') {
        return tauri;
    }
    throw new TypeError(`Cannot find module '${moduleName}'`);
};

ReactDOM.render(GUI, document.getElementById('app'));
