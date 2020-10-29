const assert   = require('assert');
const { expect } = require("chai");
const {
  createBuilder,
  createTempDir,
} = require("broccoli-test-helper");
const AssetPrepend  = require('..');

describe('broccoli-asset-prepend', function() {
  it('prepends paths to assets', async function(){
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
  })
});
