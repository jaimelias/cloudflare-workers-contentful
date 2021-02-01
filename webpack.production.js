const webpack = require('webpack');
const path = require('path');

module.exports = {
	target: 'webworker',
	entry: './index.js',
	mode: 'production',
	plugins: [
		new webpack.ProvidePlugin({
			marked: 'marked',
			Utilities: path.resolve(__dirname, './src/utilities/coreUtilities'),
			Contentful: path.resolve(__dirname, './src/utilities/contentfulUtilities'),
			LangConfig: path.resolve(__dirname, './src/lang/langConfig')
		}),
	]	
}