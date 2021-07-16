const webpack = require('webpack');
const path = require('path');

module.exports = {
	target: 'webworker',
	devtool: 'cheap-module-source-map',
	entry: './index.js',
	mode: 'development',
	plugins: [
		new webpack.ProvidePlugin({
			marked: 'marked',
			Utilities: path.resolve(__dirname, './src/utilities/utilities'),
			Contentful: path.resolve(__dirname, './src/utilities/contentful'),
			LangConfig: path.resolve(__dirname, './src/lang/langConfig'),
			ActionTypes: path.resolve(__dirname, './src/redux/actionTypes'),
			SharedData: path.resolve(__dirname, './src/utilities/sharedData'),
			Bookings: path.resolve(__dirname, './src/utilities/bookings'),
		}),
	]
}