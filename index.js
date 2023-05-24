const HtmlWebpackPlugin = require('html-webpack-plugin');

class InjectVersionPlugin {
	static defaultOptions = {
		outputFile: 'version.json',
		version: '0.0.1'
	};
	constructor(options = {}) {
		this.options = { ...InjectVersionPlugin.defaultOptions, ...options };
	}
	apply(compiler) {
		compiler.hooks.compilation.tap('InjectVersionPlugin', (compilation) => {
			HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tap(
				'InjectVersionPlugin', // <-- Set a meaningful name here for stacktraces
				(data) => {
					const versionFile = JSON.stringify({
						js: data.assets.js,
						css: data.assets.css,
						publicPath: data.assets.publicPath == '/' ? '' : data.assets.publicPath
					})
					compilation.assets[this.options.outputFile] = {
						source() {
							return versionFile
						},
						size() {
							return versionFile.length
						}
					};
				}
			)
			HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap(
				'InjectVersionPlugin',
				(data) => {
					// Manipulate the content
					console.log(data)
					data.assetTags.styles = [];
					data.assetTags.scripts = [{
						tagName: 'script',
						voidTag: false,
						innerHTML: `
							(function (window) {
								fetch('./version.json').then(res => res.json()).then(result => {
									console.log(result);
									(result.js || []).forEach((item, index) => {
										var script = document.createElement('script')
										script.type = 'text/javascript'
										script.src = item
										window.document.body.appendChild(script)
									});
									(result.css || []).forEach(item => {
										var link = document.createElement("link");
										link.rel = "stylesheet";
										link.type = "text/css";
										link.href = item;
										var head = window.document.getElementsByTagName("head")[0];
										head.appendChild(link);
									});
								})
							})(window)
						`
					}];
				}
			)
		});
	}
}
module.exports = InjectVersionPlugin;