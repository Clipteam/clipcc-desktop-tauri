import bindAll from 'lodash.bindall';
import omit from 'lodash.omit';
import * as PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {loadExtensionFromFile} from 'clipcc-gui/src';
import TauriStorageHelper from './TauriStorageHelper';
import React from 'react';

import {
    LoadingStates,
    onFetchedProjectData,
    onLoadedProject,
    defaultProjectId,
    requestNewProject,
    requestProjectUpload,
    setProjectId
} from 'clipcc-gui/src/reducers/project-state';
import {
    openLoadingProject,
    closeLoadingProject,
    openTelemetryModal
} from 'clipcc-gui/src/reducers/modals';

const getInitialProjectData = (): Promise<any> => Promise.resolve();
const showPrivacyPolicy = (): Promise<any> => Promise.resolve();

/**
 * Higher-order component to add desktop logic to the GUI.
 * @param {Component} WrappedComponent - a GUI-like component to wrap.
 * @returns {Component} - a component similar to GUI with desktop-specific logic added.
 */
const ScratchDesktopGUIHOC = function (WrappedComponent: typeof React.Component): any {
    class ScratchDesktopGUIComponent extends React.Component<any> {
        static propTypes: {};
        constructor (props: any) {
            super(props);
            bindAll(this, [
                'handleProjectTelemetryEvent',
                'handleSetTitleFromSave',
                'handleGetExtension',
                'handleLoadExtension',
                'handleStorageInit',
                'handleUpdateProjectTitle'
            ]);
            this.props.onLoadingStarted();

            getInitialProjectData().then(initialProjectData => {
                const hasInitialProject = initialProjectData && (initialProjectData.length > 0);
                this.props.onHasInitialProject(hasInitialProject, this.props.loadingState);
                if (!hasInitialProject) {
                    this.props.onLoadingCompleted();
                    return;
                }
                this.props.vm.loadProject(initialProjectData).then(
                    () => {
                        this.props.onLoadingCompleted();
                        this.props.onLoadedProject(this.props.loadingState, true);
                    },
                    (e: { message: any; }) => {
                        this.props.onLoadingCompleted();
                        this.props.onLoadedProject(this.props.loadingState, false);
                        (alert as any as Function)({
                            type: 'error',
                            title: 'Failed to load project',
                            message: 'Invalid or corrupt project file.',
                            detail: e.message
                        });

                        // this effectively sets the default project ID
                        // TODO: maybe setting the default project ID should be implicit in `requestNewProject`
                        this.props.onHasInitialProject(false, this.props.loadingState);

                        // restart as if we didn't have an initial project to load
                        this.props.onRequestNewProject();
                    }
                );
            });
            /*
            ipcRenderer.invoke('get-local-extension-files').then(extensionFiles => {
                for (const file of extensionFiles) {
                    this.props.loadExtensionFromFile(file, 'ccx');
                }
            });
            */
        }
        componentDidMount () {
            /*
            ipcRenderer.on('setTitleFromSave', this.handleSetTitleFromSave);
            ipcRenderer.on('loadExtensionFromFile', this.handleLoadExtension);
            ipcRenderer.on('getExtension', this.handleGetExtension);
            */
        }

        componentWillUnmount () {
            /*
            ipcRenderer.removeListener('setTitleFromSave', this.handleSetTitleFromSave);
            ipcRenderer.removeListener('loadExtensionFromFile', this.handleLoadExtension);
            ipcRenderer.removeListener('getExtension', this.handleGetExtension);
            */
        }
        handleClickAbout () {
            // ipcRenderer.send('open-about-window');
        }
        handleProjectTelemetryEvent () {
            // ipcRenderer.send(event, metadata);
        }
        handleSetTitleFromSave (_event: any, args: { title: any; }) {
            this.handleUpdateProjectTitle(args.title);
        }
        handleLoadExtension (_event: any, args: { extension: any; }) {
            this.props.loadExtensionFromFile(args.extension, 'ccx');
        }
        handleGetExtension () {
            // ipcRenderer.invoke('set-extension', this.props.extension);
        }
        // eslint-disable-next-line no-unused-vars
        handleStorageInit (storageInstance: { addHelper: (arg0: TauriStorageHelper) => void; }) {
            storageInstance.addHelper(new TauriStorageHelper(storageInstance));
        }
        handleUpdateProjectTitle (newTitle: any) {
            this.setState({projectTitle: newTitle});
        }
        render () {
            const childProps = omit(this.props, Object.keys(ScratchDesktopGUIComponent.propTypes));

            return (<WrappedComponent
                canEditTitle
                canModifyCloudData={false}
                canSave={false}
                isStandalone
                isScratchDesktop
                onClickAbout={[
                    {
                        title: 'About',
                        onClick: () => this.handleClickAbout()
                    },
                    {
                        title: 'Privacy Policy',
                        onClick: () => showPrivacyPolicy()
                    },
                    {
                        title: 'Data Settings',
                        onClick: () => this.props.onTelemetrySettingsClicked()
                    }
                ]}
                onProjectTelemetryEvent={this.handleProjectTelemetryEvent}
                onShowPrivacyPolicy={showPrivacyPolicy}
                onStorageInit={this.handleStorageInit}
                onUpdateProjectTitle={this.handleUpdateProjectTitle}

                // allow passed-in props to override any of the above
                {...childProps}
            />);
        }
    }

    ScratchDesktopGUIComponent.propTypes = {
        extension: PropTypes.shape({
            extensionId: PropTypes.string,
            iconURL: PropTypes.string,
            insetIconURL: PropTypes.string,
            author: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.arrayOf(PropTypes.string)
            ]),
            name: PropTypes.string,
            description: PropTypes.string,
            requirement: PropTypes.arrayOf(PropTypes.string)
        }),
        loadingState: PropTypes.oneOf(LoadingStates),
        loadExtensionFromFile: PropTypes.func,
        onFetchedInitialProjectData: PropTypes.func,
        onHasInitialProject: PropTypes.func,
        onLoadedProject: PropTypes.func,
        onLoadingCompleted: PropTypes.func,
        onLoadingStarted: PropTypes.func,
        onRequestNewProject: PropTypes.func,
        onTelemetrySettingsClicked: PropTypes.func,
        // using PropTypes.instanceOf(VM) here will cause prop type warnings due to VM mismatch
        // vm: GUIComponent.WrappedComponent.propTypes.vm
        vm: PropTypes.shape({})
    };
    const mapStateToProps = (state: any) => {
        const loadingState = state.scratchGui.projectState.loadingState;
        return {
            loadingState: loadingState,
            vm: state.scratchGui.vm,
            extension: state.scratchGui.extension.extension
        };
    };
    const mapDispatchToProps = (dispatch: any) => ({
        onLoadingStarted: () => dispatch(openLoadingProject()),
        onLoadingCompleted: () => dispatch(closeLoadingProject()),
        onHasInitialProject: (hasInitialProject: any, loadingState: any) => {
            if (hasInitialProject) {
                // emulate sb-file-uploader
                return dispatch(requestProjectUpload(loadingState));
            }

            // `createProject()` might seem more appropriate but it's not a valid state transition here
            // setting the default project ID is a valid transition from NOT_LOADED and acts like "create new"
            return dispatch(setProjectId(defaultProjectId));
        },
        onFetchedInitialProjectData: (projectData: any, loadingState: any) =>
            dispatch(onFetchedProjectData(projectData, loadingState)),
        onLoadedProject: (loadingState: any, loadSuccess: any) => {
            const canSaveToServer = false;
            return dispatch(onLoadedProject(loadingState, canSaveToServer, loadSuccess));
        },
        onRequestNewProject: () => dispatch(requestNewProject(false)),
        onTelemetrySettingsClicked: () => dispatch(openTelemetryModal()),
        loadExtensionFromFile: (file: any, type: any) => loadExtensionFromFile(dispatch, file, type)
    });

    return connect(mapStateToProps, mapDispatchToProps)(ScratchDesktopGUIComponent);
};

export default ScratchDesktopGUIHOC;
