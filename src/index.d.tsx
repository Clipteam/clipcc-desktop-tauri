declare module 'clipcc-gui/src/index' {
    import * as React from 'react';
    // eslint-disable-next-line no-unused-vars
    export const loadExtensionFromFile: (dispatch: any, file: string, type: string) => Promise<void>;
    export const AppStateHOC: any;
    export const initExtension: any;
    export const setAppElement: any;
    const GUI: typeof React.Component;
    export default GUI;
}
declare module 'clipcc-gui/src/lib/app-state-hoc.jsx' {
    // eslint-disable-next-line no-duplicate-imports
    import * as React from 'react';
    const GUI: typeof React.Component;
    export default GUI;
}
declare module 'clipcc-gui/src/reducers/project-state' {
    export const LoadingStates: any;
    export const onFetchedProjectData: any;
    export const onLoadedProject: any;
    export const defaultProjectId: any;
    export const requestNewProject: any;
    export const requestProjectUpload: any;
    export const setProjectId: any;
}
declare module 'clipcc-gui/src/reducers/modals' {
    export const openLoadingProject: any;
    export const closeLoadingProject: any;
    export const openTelemetryModal: any;
}
declare module 'clipcc-gui/src/lib/isScratchDesktop' {
    export const isScratchDesktop: any;
    export const setIsScratchDesktop: any;
}
declare module '*.css' {
    const styles: { [styleName: string]: string };
    export = styles;
}
