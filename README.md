# broccoli-asset-prepend

[Broccoli](https://github.com/broccolijs/broccoli) plugin to add prepend asset references with a scheme + domain or root path.

Turns

```
<script src="assets/appname.js">
background: url('/images/foo.png');
```

Into

```
<script src="https://subdomain.cloudfront.net/assets/appname.js">
background: url('https://subdomain.cloudfront.net/images/foo.png');
```

## Installation

```js
npm install broccoli-asset-prepend --save-dev
```

## Usage

```js
var AssetPrepend = require('broccoli-asset-prepend');

var assetNode = new AssetPrepend(node, {
  assetExtensions: ['js', 'css', 'png', 'jpg', 'gif'],
  replaceExtensions: ['html', 'js', 'css'],
  ignore: ['testem.js'],
  prepend: 'https://subdomain.cloudfront.net/'
});
```

## Options

  - `prepend` - Default: `''` - A string to prepend to all of the assets. Commonly a CDN url like `https://subdomain.cloudfront.net/`
  - `assetExtensions` - Default: `['js', 'css', 'png', 'jpg', 'gif', 'map']` - The file types to prepend.
  - `replaceExtensions` - Default: `['html', 'css', 'js']` - The file types to replace source code with new checksum file names.
  - `ignore` - Default: `[]` - An array of paths to skip rewriting.
  - `enableCaching` - Default: true - If true, will set this options on broccoli-asset-rewrite
  - `assetFileFilter` - Default: a function always returning true - Asset files matching `assetExtensions` will be passed through this filter giving you the opportunity to exclude some assets. broccoli-asset-rewrite is slower with a larger assetMap, so this can be useful to optimize build times.
  - `annotation` - Default: null. A human-readable description for this plugin instance.

## Default settings

The default [settings](https://github.com/yapplabs/broccoli-asset-prepend/blob/master/lib/default-options.js) are available if needed in your application or addon via:
`var broccoliAssetPrependDefaults = require( 'broccoli-asset-prepend/lib/default-options' );`

## Ember CLI addon usage

```js
var app = new EmberApp({
  assetPrepend: {
    prepend: 'https://sudomain.cloudfront.net/'
  }
});
```

## Ember CLI addon options

This addon runs in the postProcessTree hook.

See Options section above for explanations and defaults

  - `enabled` - Default: true - will skip entirely if false
  - `prepend` - Default: null - Required
  - `assetExtensions`
  - `replaceExtensions`
  - `ignore`
  - `enableCaching`
  - `assetFileFilter`
 
## Credits

Thanks to [broccoli-asset-rev](https://github.com/rickharrison/broccoli-asset-rev) for inspiration
and to [Precision Nutrition](https://github.com/PrecisionNutrition) for sponsoring the work on this plugin.
