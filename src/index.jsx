import React from 'react'
import ReactDOM from 'react-dom'
import * as tauri from '@tauri-apps/api'
import GUI from './app.jsx'
window.require = function(moduleName) {
    if (moduleName in tauri) {
        return tauri[moduleName]
    }
    throw new TypeError(`Cannot find module '${moduleName}'`)
}
ReactDOM.render(GUI, document.getElementById('app'))