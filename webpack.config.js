const path = require('path')
const pkg = require('./package.json')


module.exports = {
	mode: pkg.mode,
    entry: './src/index.ts',
    target: 'node',
	resolve: {
		extensions: ['.ts','.js']
	},
	output: {
		path: path.join(__dirname, '/dist'),
        filename: 'index.js',
        library: 'AirtableUtils',
        libraryTarget: 'this',
        scriptType: 'text/javascript'
    },
    optimization: {
        minimize: false
    },
	plugins: [],
    module: {
        rules: [{
            test: /\.ts(x?)$/,
            include: path.resolve(__dirname, 'src'),
            exclude: /node_modules/,
            loader: "ts-loader"
        }, {
            enforce: "pre",
            test: /\.js$/,
            include: path.resolve(__dirname, 'src'),
            exclude: /node_modules/,
            loader: "source-map-loader"
        }]
	},
	devServer: {
        contentBase: path.join(__dirname, 'dist'),
        writeToDisk: true
    }
}