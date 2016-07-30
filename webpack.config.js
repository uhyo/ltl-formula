'use strict';
const path=require('path');
const webpack=require('webpack');

module.exports={
    devtool: 'source-map',
    entry: {
        js: './dist/web.js',
        html: './html/index.html',
    },
    output: {
        path: path.join(__dirname, 'dist-web'),
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: "file?name=[name].html"
            }
        ]
    },
    node: {
        fs: "empty",
    },
    plugins: [
    ],
    
    devServer: {
        contentBase: "./dist/client",
        port: 8080,
    },
};

