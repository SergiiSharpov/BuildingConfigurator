const CopyWebpackPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './../build'),
        filename: 'bundle.js',
        chunkFilename: 'bundle.chunk[id].js'
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                    output: {
                        comments: false,
                    }
                }
            })
        ]
    },
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: [
                    {
                        loader: 'worker-loader'
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            plugins: [
                                '@babel/plugin-transform-runtime',
                                '@babel/plugin-proposal-export-default-from',
                                '@babel/plugin-proposal-export-namespace-from',
                                '@babel/plugin-syntax-dynamic-import',
                                '@babel/plugin-proposal-class-properties',
                                '@babel/plugin-proposal-private-methods'
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    plugins: [
                        '@babel/plugin-transform-runtime',
                        '@babel/plugin-proposal-export-default-from',
                        '@babel/plugin-proposal-export-namespace-from',
                        '@babel/plugin-syntax-dynamic-import',
                        '@babel/plugin-proposal-class-properties',
                        '@babel/plugin-proposal-private-methods'
                    ]
                }
            },
            {
                test: /\.glsl$/,
                use: [{loader: 'raw-loader'}]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                from: 'public/assets/**/*',
                transformPath: (targetPath, absolutePath) => {
                    return targetPath.replace('public', '');
                },
            },
            'public/main.css',
        ]),
        new HtmlWebpackPlugin({template: './public/index.html'})
    ]
};
