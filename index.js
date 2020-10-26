const AssetPrepend = require('./lib/asset-prepend')
const defaults = require('./lib/default-options');

module.exports = {
  name: 'broccoli-asset-prepend',
  initializeOptions: function() {
    var defaultOptions = {
      enabled: defaults.enabled,
      assetExtensions: defaults.assetExtensions,
      replaceExtensions: defaults.replaceExtensions,
      prepend: defaults.prepend,
      enableCaching: defaults.enableCaching,
      ignore: defaults.ignore,
    };

    this.options = this.app.options.assetPrepend = this.app.options.assetPrepend || {};

    for (var option in defaultOptions) {
      if (!this.options.hasOwnProperty(option)) {
        this.options[option] = defaultOptions[option];
      }
    }
  },
  postprocessTree: function (type, tree) {
    if (type === 'all' && this.options.enabled && this.options.prepend) {
      tree = new AssetPrepend(tree, this.options);
    }

    return tree;
  },
  included: function (app) {
    this.app = app;
    this.initializeOptions();
  }
};
