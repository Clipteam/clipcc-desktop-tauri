const CopyWebpackPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const path = require('path');
const {ESBuildMinifyPlugin} = require('esbuild-loader');

// PostCss
const postcssVars = require('postcss-simple-vars');
const postcssImport = require('postcss-import');

const getModulePath = moduleName => path.dirname(require.resolve(`${moduleName}/package.json`));

// Generate metafile
require('clipcc-gui/gen-meta');

/** @type {import('webpack').Configuration} */
module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    target: 'web',
    entry: {
        index: './src/index.tsx',
        extensions: './src/extensions/extensions.tsx'
    },
    output: {
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        symlinks: false
    },
    devtool: 'source-map',
    devServer: {
        static: [
            {
                directory: path.join(__dirname, 'static'),
                publicPath: '/static'
            },
            {
                directory: path.join(getModulePath('clipcc-gui'), 'static'),
                publicPath: '/static'
            },
            {
                directory: path.join(getModulePath('clipcc-block'), 'media'),
                publicPath: '/static/blocks-media'
            }
        ],
        compress: true
    },
    // optimization: {
    //     minimizer: [
    //         new ESBuildMinifyPlugin()
    //     ]
    // },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'tsx',
                    // eslint-disable-next-line global-require
                    tsconfigRaw: require('./tsconfig.json')
                }
            },
            {
                test: /\.jsx?$/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'jsx'
                }
            },
            {
                test: /\.css$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        importLoaders: 1,
                        localIdentName: '[name]_[local]_[hash:base64:5]',
                        // localIdentName: '[path][name]_[local]',
                        camelCase: true
                    }
                }, {
                    loader: 'postcss-loader',
                    options: {
                        ident: 'postcss',
                        plugins: function () {
                            return [
                                postcssImport,
                                postcssVars
                            ];
                        }
                    }
                }]
            },
            {
                test: /\.(svg|png|wav|gif|jpg)$/,
                loader: 'file-loader',
                options: {
                    outputPath: 'static/assets/',
                    publicPath: `static/assets/`
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, 'static'),
            to: './static'
        }, {
            from: path.resolve(__dirname, 'src', 'index.html'),
            to: '.'
        }, {
            from: path.resolve(__dirname, 'src', 'extensions', 'extensions.html'),
            to: '.'
        }, {
            from: path.resolve(__dirname, 'src', 'index.css'),
            to: '.'
        }, {
            from: path.resolve(getModulePath('clipcc-block'), 'media'),
            to: './static/blocks-media'
        }, {
            from: path.resolve(getModulePath('clipcc-gui'), 'static'),
            to: './static'
        }])
    ]
};
