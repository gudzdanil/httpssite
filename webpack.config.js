var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var precss = require('precss');
var autoprefixer = require('autoprefixer');
var path = require("path");
var pkg = require('./package.json');

const TARGET = process.env.npm_lifecycle_event || 'dev';

var rootPath = __dirname;
var distPath = path.join(rootPath);
var srcPath = path.join(rootPath, "src");

var webpackConfig = {
    context: srcPath,
    entry: {
        app: pkg.main,
        vendor: convertDependeciesObjToArr(pkg.dependencies)
    },
    output: {
        path: distPath,
        filename: "[name].bundle.js"
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: path.join(distPath, "index.html"),
            template: path.join(srcPath, "index.html")
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            _: "lodash",
            lodash: "lodash"
        })
    ],
    module: {
        loaders: [
            {test: /\.js$/, loader: 'ng-annotate?add=true&stats=true&!babel-loader', exclude: /node_modules/},
            {test: /\.html$/, loader: 'raw-loader'},
            {test: /\.css$/, loader: 'style-loader!css-loader!postcss-loader'},
            {test: /\.scss$/, loader: 'style-loader!css-loader!postcss-loader!sass-loader'},
            {test: /\.less/, loader: 'style-loader!css-loader!postcss-loader!less-loader'},
            {test: /\.json/, loader: 'json-loader'},
            {test: /\.png$|\.jpg$|\.gif|\.svg|\.eot|\.woff|\.woff2|\.ttf$/, loader: 'url-loader?name=[path][name].[ext]'}
        ]
    },
    postcss: function () {
        return [precss, autoprefixer];
    }
};

webpackConfig.debug = true;
webpackConfig.devtool = 'source-map';
webpackConfig.plugins.push(
    new webpack.optimize.CommonsChunkPlugin(
        "vendor",
        "vendor.bundle.js"
    )
);

if (TARGET.indexOf('dev') == 0) {
    webpackConfig.watch = true;
    webpackConfig.devServer = {
        contentBase: distPath,
        inline: true,
        open: true
    };
    webpackConfig.module.preLoaders = [
        {
            test: /\.js$/,
            loaders: ['eslint'],
            include: [
                srcPath
            ]
        }
    ];
}
else if (TARGET === 'build') {
    // webpackConfig.devtool = false;
    // webpackConfig.debug = false;
    // webpackConfig.entry = webpackConfig.entry.app;
    // webpackConfig.output.filename = 'bundle.js';
    // webpackConfig.plugins.push(new CleanWebpackPlugin([distPath], {
    //     root: path.resolve(distPath, '..')
    // }));
    // webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true, comments: false, compress: {
    //     drop_console: true
    // }}));
}

module.exports = webpackConfig;

/**
 * Converts package.json dependencies object to array
 * @param libs
 * @returns {Array} npm modules array
 */
function convertDependeciesObjToArr(libs) {
    var arr = [];
    for(var i in libs) {
        if(libs.hasOwnProperty(i)) {
            arr.push(i);
        }
    }
    return arr;
}
