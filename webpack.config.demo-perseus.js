const path = require("path");

module.exports = {
    entry: {
        "demo-perseus": "./src/demo-perseus.js",
        "frame-perseus": "./src/perseus-frame.js",
    },
    stats: {
        children: true
    },
    output: {
        path: path.resolve(__dirname, 'build/'),
        publicPath: "/",
        filename: "[name].js",
        chunkFilename: "[name].chunk.js"
    },
    devServer: {
        historyApiFallback:{
            index: "index.html"
        },
        hot: true,
        liveReload: false,
        port: 3000,
        compress: true,
        contentBase: __dirname
    },
    plugins: require('./webpack.config.js').plugins,
    module: require('./webpack.config.js').module,
    devtool: 'inline-source-map',
    mode: "development"
};
