const assert   = require('assert');
const fixture = require('broccoli-fixture');
const AssetPrepend  = require('..');

describe('broccoli-asset-prepend', function() {
  it('prepends paths to assets', async function(){
    let inputNode = new fixture.Node({
      'index.html': `<script src="assets/foo.js" />`,
      'assets': {
        'foo.js': `foo.js contents`,
      }
    });
    let node = new AssetPrepend(inputNode, {
      prepend: 'https://subdomain.cloudfront.net/'
    });

    let outputHash = await fixture.build(node);
    assert.deepStrictEqual(outputHash, {
      'index.html': `<script src="https://subdomain.cloudfront.net/assets/foo.js" />`,
      'assets': {
        'foo.js': `foo.js contents`,
      }
    });
  })
});
