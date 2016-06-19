"use strict";

function randomString(len, charSet) {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
}

QUnit.test( "LZString tests", function( assert ) {
  for (var i = 0; i < 1000; i++) {
    var str = randomString(i);
    var compressed = LZString.compressToUint8Array(str);
    var decompressed = LZString.decompressFromUint8Array(compressed);
    assert.equal(decompressed, str);
  }
});

var crypto_test = function(assert, str, pw) {
  var done = assert.async();
  encrypt(pw, LZString.compressToUint8Array(str)).then(function(encrypted_data) {
    decrypt(pw, encrypted_data).then(function(decrypted_data) {
      decrypted_data = new Uint8Array(decrypted_data);
      var decompressed = LZString.decompressFromUint8Array(decrypted_data);
      assert.equal(decompressed, str);
      done();
    });
  })
};

QUnit.test( "Crypto tests", function( assert ) {
  if (typeof crypto.subtle === 'undefined') {
    // PhantomJS doesn't support WebCrypto.
    assert.expect(0);
    return;
  }
  for (var i = 0; i < 100; i = i * 10 + 1) {
    for (var j = 0; j < 20; j += 10) {
      var str = randomString(i);
      var pw = randomString(j);
      crypto_test(assert, str, pw);
    }
  }
});

QUnit.test( "Stego tests", function( assert ) {
  var stego = new MarkovTextStego();
  var codec = new stego.Codec(null);
  var model = new stego.NGramModel(1);
  model.import(corpora["prince"]);
  codec.setModel(model);

  for (var i = 0; i < 1000; i = i * 4 + 1) {
    var str = randomString(i);
    var steg = codec.encode(LZString.compressToUint8Array(str));
    var decoded = codec.decode($.trim(steg));
    var decompressed = LZString.decompressFromUint8Array(decoded);
    assert.equal(decompressed, str);
  }
});
