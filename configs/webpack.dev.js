const CopyWebpackPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './../build'),
        filename: 'bundle.js',
        chunkFilename: 'bundle.chunk[id].js'
    },
    devServer: {
        publicPath: '/public'
    },
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                exclude: /node_modules/,
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
                    },
                    // {
                    //     loader: 'eslint-loader',
                    // }
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
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
                    },
                    // {
                    //     loader: 'eslint-loader',
                    // }
                ]
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
        new HtmlWebpackPlugin({
            template: './public/index.html'
        })
    ]
};
