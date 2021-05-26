const HtmlWebPackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    context: __dirname,
    entry: [
        './app/index.js'
    ],
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: 'main.js',
        publicPath: '/'
    },
    devServer: {
        inline: true,
        historyApiFallback: true,
        stats: 'errors-only',
        port: 8095,
        proxy: {
            '/api/**': {
                target: 'http://localhost:4000',
                pathRewrite: {'^/api': ''}
            },
            '/socket.io': {
                target: 'http://localhost:4000',
                ws: true
            }
        }
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.js$/,
            enforce: 'pre',
            use: ['source-map-loader']
        }]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: path.resolve( __dirname, 'public/index.html' ),
            filename: 'index.html'
        })
    ]
};