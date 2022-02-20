import * as React from 'react';
import ReactDOM from 'react-dom';
import {getInstalledExtensions} from './channel';
import styles from './extensions.css';
import {ClipCCPlugin, PluginsMeta} from './plugin';
import PluginCard from './plugin-card';
import Search from './search';

const ExtensionManager: React.FC = () => {
    const [pluginList, setPluginList] = React.useState<undefined | ClipCCPlugin[]>();
    const [filteredPluginList, setFilteredPluginList] = React.useState<ClipCCPlugin[]>([]);
    const [search, setSearch] = React.useState('');

    React.useEffect(() => {
        (async () => {
            const res = await fetch('https://raw.githubusercontent.com/Clipteam/clipcc-extension-list/master/list.json');
            const meta = await res.json() as PluginsMeta;
            const installed = await getInstalledExtensions();
            const plugins = meta.data.map(
                plugin => ({
                    ...plugin,
                    installed: installed.some(installedPlugin => installedPlugin === plugin.id)
                })
            );
            setPluginList(plugins);
        })();
    }, []);
    
    React.useEffect(() => {
        if (pluginList) {
            setFilteredPluginList(
                pluginList.filter(plugin => plugin.name.toLowerCase().includes(search.toLowerCase()))
            );
        }
    }, [pluginList, search]);
    
    const onInstalled = (plugin: ClipCCPlugin) => {
        setPluginList(pluginList.map(p => {
            if (p.id === plugin.id) {
                return {...p, installed: true};
            }
            return p;
        }));
    };
        
    return <>
        <header className={styles.header}>
            <Search
                className={styles.search}
                onChange={v => setSearch(v.target.value)}
                filterQuery={search}
                inputClassName={styles.filterInput}
                onClear={() => setSearch('')}
            />
        </header>
        <div className={styles.extensionList}>
            {filteredPluginList.map(plugin => <PluginCard
                key={plugin.id}
                plugin={plugin}
                onInstalled={() => onInstalled(plugin)}
            />)}
        </div>
    </>;
};

ReactDOM.render(<ExtensionManager />, document.getElementById('extensions'));
