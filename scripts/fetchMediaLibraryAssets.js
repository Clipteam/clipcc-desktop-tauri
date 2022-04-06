const fs = require('fs');
const path = require('path');
const util = require('util');

const async = require('async');

const libraries = require('./lib/libraries');

const ASSET_HOST = process.env.ASSET_HOST || 'cdn.assets.scratch.mit.edu';
const ASSET_URL_FORMAT = process.env.ASSET_URL_FORMAT || 'https://[ASSET_HOST]/internalapi/asset/[MD5]/get/';
const NUM_SIMULTANEOUS_DOWNLOADS = 64;
const OUT_PATH = path.resolve(__dirname, '../src-tauri', 'assets');

let proxy;

try {
    if (process.env.HTTPS_PROXY) {
        const url = new URL(process.env.HTTPS_PROXY);
        proxy = {
            host: url.hostname,
            port: parseInt(url.port, 10),
            protocol: url.protocol
        };
    } else if (process.env.HTTP_PROXY) {
        const url = new URL(process.env.HTTP_PROXY);
        proxy = {
            host: url.hostname,
            port: parseInt(url.port, 10),
            protocol: url.protocol
        };
    }
} catch (err) {
    // Ignored
}


const axios = require('axios').default.create({
    proxy
});

try {
    fs.rmSync(OUT_PATH, {recursive: true, force: true});
} catch (err) {
    try {
        fs.rmdirSync(OUT_PATH, {recursive: true});
    } catch (_err) {
        // Ignore
    }
}
fs.mkdirSync(OUT_PATH, {recursive: true});

const describe = function (object) {
    return util.inspect(object, false, 3, true);
};

const collectSimple = function (library, dest, debugLabel = 'Item') {
    library.forEach(item => {
        let md5Count = 0;
        if (item.md5) {
            ++md5Count;
            dest.add(item.md5);
        }
        if (item.baseLayerMD5) { // 2.0 library syntax for costumes
            ++md5Count;
            dest.add(item.baseLayerMD5);
        }
        if (item.md5ext) { // 3.0 library syntax for costumes
            ++md5Count;
            dest.add(item.md5ext);
        }
        if (md5Count < 1) {
            console.warn(`${debugLabel} has no MD5 property:\n${describe(item)}`);
        } else if (md5Count > 1) {
            // is this actually bad?
            console.warn(`${debugLabel} has multiple MD5 properties:\n${describe(item)}`);
        }
    });
    return dest;
};

const collectAssets = function (dest) {
    collectSimple(libraries.backdrops, dest, 'Backdrop');
    collectSimple(libraries.costumes, dest, 'Costume');
    collectSimple(libraries.sounds, dest, 'Sound');
    libraries.sprites.forEach(sprite => {
        if (sprite.costumes) {
            collectSimple(sprite.costumes, dest, `Costume for sprite ${sprite.name}`);
        }
        if (sprite.sounds) {
            collectSimple(sprite.sounds, dest, `Sound for sprite ${sprite.name}`);
        }
    });
    return dest;
};

const connectionPool = [];

const fetchAsset = function (md5, callback) {
    (async () => {
        const savePath = path.resolve(OUT_PATH, md5);
        if (fs.existsSync(savePath)) {
            console.log(`Skipping ${md5} (already exists).`);
            return callback();
        }
        const urlHuman = ASSET_URL_FORMAT.replace('[ASSET_HOST]', ASSET_HOST).replace('[MD5]', md5);
        /** @type {import("http").IncomingMessage} */
        const result = (await axios.get(urlHuman, {
            responseType: 'stream'
        })).data;
        const stream = fs.createWriteStream(savePath, {encoding: 'binary'});
        stream.on('error', callback || console.error);
        result.pipe(stream);
        result.on('end', () => {
            stream.end();
            console.log(`Fetched ${urlHuman}`);
            if (callback) callback();
        });
    })();
};

const fetchAllAssets = function () {
    const allAssets = collectAssets(new Set());
    console.log(`Total library assets: ${allAssets.size}`);

    async.forEachLimit(allAssets, NUM_SIMULTANEOUS_DOWNLOADS, fetchAsset, err => {
        if (err) {
            console.error(`Fetch failed:\n${describe(err)}`);
        } else {
            console.log('Fetch succeeded.');
        }

        console.log(`Shutting down ${connectionPool.length} agents.`);
        while (connectionPool.length > 0) {
            connectionPool.pop().destroy();
        }
    });
};

fetchAllAssets();
