const AssetRewrite = require('broccoli-asset-rewrite');
const stew = require('broccoli-stew');
const glob = require('glob');
const defaults = require('./default-options');

class AssetPrepend {
  constructor(inputNode, options) {
    options = options || {};
  
    this.assetMap = {};
    this.assetExtensions = options.assetExtensions || defaults.assetExtensions;
    this.replaceExtensions = options.replaceExtensions || defaults.replaceExtensions;
    this.enableCaching = options.enableCaching === undefined ? defaults.enableCaching : options.enableCaching;
    this.prepend = options.prepend || defaults.prepend;
    this.ignore = options.ignore;
    this.assetFileFilter = options.assetFileFilter || defaults.assetFileFilter;

    let resultNode = this.updateAssetMap(inputNode);
    return this.rewriteAssets(resultNode);
  }
  
  updateAssetMap(node) {
    let { assetMap, assetExtensions, assetFileFilter } = this;
    return stew.afterBuild(node, function() {
      // clear the assetMap
      let key;
      for (key in assetMap) delete assetMap[key];

      // populate the assetMap
      let [inputPath] = this.inputPaths;
      let assetFiles = glob.sync(`**/*.@(${assetExtensions.join('|')})`, { cwd: inputPath }).filter(assetFileFilter);
      let assetFile;
      for (assetFile of assetFiles) {
        assetMap[assetFile] = assetFile;
      }
    });
  }

  rewriteAssets(node) {
    return new AssetRewrite(node, {
      assetMap: this.assetMap,
      prepend: this.prepend,
      replaceExtensions: this.replaceExtensions,
      annotation: 'asset-prepend',
      enableCaching: this.enableCaching,
      ignore: this.ignore,
    });
  }
}

module.exports = AssetPrepend;
