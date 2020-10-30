const assert   = require('assert');
const { expect } = require("chai");
const {
  createBuilder,
  createTempDir,
} = require("broccoli-test-helper");
const AssetPrepend  = require('..');

describe('broccoli-asset-prepend', function() {
  it('does nothing without a prepend option specified', async function(){
    const input = await createTempDir();
    const subject = new AssetPrepend(input.path(), {
      prepend: null
    });
    const output = createBuilder(subject);

    input.write({
      'index.html': `<script src="assets/foo.js" />`,
      'assets': {
        'foo.js': `foo.js contents`,
      }
    });
    await output.build();
    expect(output.read()).to.deep.equal({
      'index.html': `<script src="assets/foo.js" />`,
      'assets': {
        'foo.js': `foo.js contents`,
      }
    });
  });

  it('prepends paths to assets in HTML', async function(){
    const input = await createTempDir();
    const subject = new AssetPrepend(input.path(), {
      prepend: 'https://subdomain.cloudfront.net/'
    });
    const output = createBuilder(subject);

    input.write({
      'index.html': `<script src="assets/foo.js" />`,
      'assets': {
        'foo.js': `foo.js contents`,
      }
    });
    await output.build();
    expect(output.read()).to.deep.equal({
      'index.html': `<script src="https://subdomain.cloudfront.net/assets/foo.js" />`,
      'assets': {
        'foo.js': `foo.js contents`,
      }
    });
  });

  it('prepends paths to assets in CSS if specific via replaceExtensions', async function(){
    const input = await createTempDir();
    const subject = new AssetPrepend(input.path(), {
      prepend: 'https://subdomain.cloudfront.net/',
      replaceExtensions: ['css']
    });
    const output = createBuilder(subject);

    input.write({
      'assets': {
        'image.jpg': ``,
        'app.css': `.bgimg { background: url('image.jpg'); }`,
      }
    });
    await output.build();
    expect(output.read()).to.deep.equal({
      'assets': {
        'image.jpg': ``,
        'app.css': `.bgimg { background: url('https://subdomain.cloudfront.net/assets/image.jpg'); }`,
      }
    });
  });

  it('only performs prepends in files included in replaceExtensions', async function() {
    const input = await createTempDir();
    const subject = new AssetPrepend(input.path(), {
      prepend: 'https://subdomain.cloudfront.net/',
      replaceExtensions: ['html']
    });
    const output = createBuilder(subject);

    input.write({
      'index.html': `
        <script src="assets/app.js" />
        <img src="assets/image.jpg" />
      `,
      'assets': {
        'image.jpg': ``,
        'app.js': `new Image('/assets/image.jpg');`,
        'app.css': `.bgimg { background: url('image.jpg); }`,
      }
    });
    await output.build();
    expect(output.read()).to.deep.equal({
      'index.html': `
        <script src="https://subdomain.cloudfront.net/assets/app.js" />
        <img src="https://subdomain.cloudfront.net/assets/image.jpg" />
      `,
      'assets': {
        'image.jpg': ``,
        'app.js': `new Image('/assets/image.jpg');`,
        'app.css': `.bgimg { background: url('image.jpg); }`,
      }
    });
  });

  it('uses an assetFileFilter function to optionally exclude assets from prepending', async function() {
    const input = await createTempDir();
    const subject = new AssetPrepend(input.path(), {
      prepend: 'https://subdomain.cloudfront.net/',
      assetFileFilter(path) {
        if (path === 'assets/vendor.js') {
          return false;
        }
        return true;
      }
    });
    const output = createBuilder(subject);

    input.write({
      'index.html': `<script src="assets/app.js" /><script src="assets/vendor.js" />`,
      'assets': {
        'app.js': `app.js contents`,
        'vendor.js': `vendor.js contents`,
      }
    });
    await output.build();
    expect(output.read()).to.deep.equal({
      'index.html': `<script src="https://subdomain.cloudfront.net/assets/app.js" /><script src="assets/vendor.js" />`,
      'assets': {
        'app.js': `app.js contents`,
        'vendor.js': `vendor.js contents`,
      }
    });
  });

  it('does not update files specified in the ignore array', async function() {
    const input = await createTempDir();
    const subject = new AssetPrepend(input.path(), {
      prepend: 'https://subdomain.cloudfront.net/',
      ignore: ['index2.html']
    });
    const output = createBuilder(subject);

    input.write({
      'index.html': `<script src="assets/app.js" />`,
      'index2.html': `<script src="assets/app.js" />`,
      'assets': {
        'app.js': `app.js contents`,
      }
    });
    await output.build();
    expect(output.read()).to.deep.equal({
      'index.html': `<script src="https://subdomain.cloudfront.net/assets/app.js" />`,
      'index2.html': `<script src="assets/app.js" />`,
      'assets': {
        'app.js': `app.js contents`,
      }
    });
  });

  it('replaces assets with extensions listed in assetExtensions option', async function() {
    const input = await createTempDir();
    const subject = new AssetPrepend(input.path(), {
      prepend: 'https://subdomain.cloudfront.net/',
      assetExtensions: ['jpg', 'png']
    });
    const output = createBuilder(subject);

    input.write({
      'index.html': `
        <img src="assets/a.jpg" />
        <img src="assets/b.png" />  
        <img src="assets/c.gif" />  
      `,
      'assets': {
        'a.jpg': ``,
        'b.png': ``,
        'c.gif': ``,
      }
    });
    await output.build();
    expect(output.read()).to.deep.equal({
      'index.html': `
        <img src="https://subdomain.cloudfront.net/assets/a.jpg" />
        <img src="https://subdomain.cloudfront.net/assets/b.png" />  
        <img src="assets/c.gif" />  
      `,
      'assets': {
        'a.jpg': ``,
        'b.png': ``,
        'c.gif': ``,
      }
    });
  });

  it('runs with caching to make rebuilds faster', async function() {
    const input = await createTempDir();
    const subject = new AssetPrepend(input.path(), {
      prepend: 'https://subdomain.cloudfront.net/',
      assetExtensions: ['jpg', 'png']
    });
    const output = createBuilder(subject);
    let inputDirDescription = {
      "assets": {}
    };
    for(let i = 0; i < 200; i++) {
      inputDirDescription[`index_${i}.html`] = `<script src="assets/script_${i}.js" />`;
      inputDirDescription.assets[`script_${i}.js`] = `script_${i}.js contents`;
    }

    input.write(inputDirDescription);
    const run1Start = process.hrtime()
    await output.build();
    const run1End = process.hrtime(run1Start);
    input.write({
      "index_1.html": `<script async src="assets/script_1.js" />`
    });
    const run2Start = process.hrtime()
    await output.build();
    const run2End = process.hrtime(run2Start);
    const run1DurationMs = (run1End[0] * 1000000000 + run1End[1]) / 1000000;
    const run2DurationMs = (run2End[0] * 1000000000 + run2End[1]) / 1000000;
    assert.ok(run2DurationMs < (run1DurationMs / 2), `cache should make second run (${run2DurationMs}ms) at least twice as fast as first run (${run1DurationMs}ms)`);
  });

  /*
    * The test below demonstrates the following bug:
    * Steps to reproduce:
    * Create a reference to an asset (image, js, css, etc) that doesn’t yet exist in an HTML or Javascript file.
    * Build runs and does not prepend this new asset reference (because no asset with this name exists)
    * Create the missing asset file
    * Expected behavior: the asset reference would now be a match and would be prepended
    * Actual behavior: no change, because the HTML or JS file containing the reference has not changed and is cached
    * Possible fixes:
    * Rewrite broccoli asset prepend to use parsers to really understand the files it is modifying and prepend all local referenced assets without regard to whether the corresponding asset exists. Currently, it uses broccoli-asset-rewrite to perform the rewriting, which relies on an assetMap being provided to it and uses a big ol’ regular expression to find references to these assets
    * Update broccoli-asset-rewrite to recognize changes to the asset map and invalidate the cache for files containing entries that have added/updated/removed
    */
  xit('picks up new assets as they are added', async function(){
    const input = await createTempDir();
    const subject = new AssetPrepend(input.path(), {
      prepend: 'https://subdomain.cloudfront.net/'
    });
    const output = createBuilder(subject);

    input.write({
      'index.html': `
        <script src="assets/foo.js" />
        <script src="assets/bar.js" />
      `,
      'assets': {
        'foo.js': `foo.js contents`,
      }
    });
    await output.build();
    expect(output.read()).to.deep.equal({
      'index.html': `
        <script src="https://subdomain.cloudfront.net/assets/foo.js" />
        <script src="assets/bar.js" />
      `,
      'assets': {
        'foo.js': `foo.js contents`,
      }
    });
    input.write({
      'assets': {
        'bar.js': 'bar.js contents'
      }
    });
    await output.build();
    // this is failing because (I think) the assetMap changed but index.html didn't, and index.html is cached based on its contents
    expect(output.read()).to.deep.equal({
      'index.html': `
        <script src="https://subdomain.cloudfront.net/assets/foo.js" />
        <script src="https://subdomain.cloudfront.net/assets/bar.js" />
      `,
      'assets': {
        'foo.js': `foo.js contents`,
        'bar.js': 'bar.js contents'
      }
    });
  });

});
