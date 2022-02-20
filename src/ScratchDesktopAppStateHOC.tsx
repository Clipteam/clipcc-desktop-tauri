import bindAll from 'lodash.bindall';
import React from 'react';

/**
 * Higher-order component to add desktop logic to AppStateHOC.
 * @param {Component} WrappedComponent - an AppStateHOC-like component to wrap.
 * @returns {Component} - a component similar to AppStateHOC with desktop-specific logic added.
 */
const ScratchDesktopAppStateHOC = function (WrappedComponent: typeof React.Component) {
    class ScratchDesktopAppStateComponent extends React.Component<{}, {telemetryDidOptIn:boolean}> {
        constructor (props: any) {
            super(props);
            bindAll(this, [
                'handleTelemetryModalOptIn',
                'handleTelemetryModalOptOut'
            ]);
            this.state = {
                // use `sendSync` because this should be set before first render
                telemetryDidOptIn: false
            };
        }
        handleTelemetryModalOptIn () {
        }
        handleTelemetryModalOptOut () {
        }
        render () {
            const shouldShowTelemetryModal = false;

            return (<WrappedComponent
                isTelemetryEnabled={this.state.telemetryDidOptIn}
                onTelemetryModalOptIn={this.handleTelemetryModalOptIn}
                onTelemetryModalOptOut={this.handleTelemetryModalOptOut}
                showTelemetryModal={shouldShowTelemetryModal}

                // allow passed-in props to override any of the above
                {...this.props}
            />);
        }
    }

    return ScratchDesktopAppStateComponent;
};

export default ScratchDesktopAppStateHOC;
