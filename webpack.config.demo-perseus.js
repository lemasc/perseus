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
    },
    devServer: {
        historyApiFallback:{
            index: "index.html"
        },
        hot: true,
        liveReload: false,
        port: 3000,
        compress: true,
        contentBase: [
            path.join(__dirname),
            path.join(__dirname, "node_modules/mathquill/build/"),
            path.join(__dirname, "node_modules/katex/dist")
        ],
    },
    plugins: require('./webpack.config.js').plugins,
    module: require('./webpack.config.js').module,
    devtool: 'inline-source-map',
    mode: "development"
};
