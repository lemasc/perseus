const path = require("path");

module.exports = {
    entry: {
        "demo-perseus": "./src/demo-perseus.js",
        "frame-perseus": "./src/perseus-frame.js",
    },
    output: {
        path: path.resolve(__dirname, 'build/'),
        publicPath: "/build/",
        filename: "[name].js",
    },
    devServer: {
        historyApiFallback:{
            index: "index.html"
        },
    },
    plugins: require('./webpack.config.js').plugins,
    module: require('./webpack.config.js').module,
    devtool: 'inline-source-map',
    mode: "development"
};
