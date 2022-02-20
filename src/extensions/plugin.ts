export interface ClipCCPlugin {
    id: string,
    name: string,
    author: string,
    description: string,
    version: string,
    pic: string,
    download: string,
    tags: string[],
    dependencies: string[],
    installed?: boolean,
}

export interface PluginsMeta {
    updated: string
    data: ClipCCPlugin[]
}
