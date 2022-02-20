import * as React from 'react';
import styles from './plugin-card.css';
import {ClipCCPlugin} from './plugin';
import {installExtension} from './channel';

const PluginCard: React.FC<{
    plugin: ClipCCPlugin,
    onInstalled?: Function
}> = props => {
    const [installing, setInstalling] = React.useState(false);
    return <div className={styles.pluginCard}>
        <div className={styles.name}>{props.plugin.name}</div>
        <div className={styles.desc}>{props.plugin.description}</div>
        <div className={styles.buttons}>
            <button
                disabled={props.plugin.installed}
                className={props.plugin.installed ? styles.installed : ''}
                onClick={async () => {
                    if (!props.plugin.installed && !installing) {
                        setInstalling(true);
                        if (await installExtension(props.plugin) && props.onInstalled) {
                            props.onInstalled();
                        }
                        setInstalling(false);
                    }
                }}
            >
                {props.plugin.installed ? 'Installed' : installing ? 'Installing' : 'Install'}
            </button>
        </div>
    </div>;
};

export default PluginCard;
