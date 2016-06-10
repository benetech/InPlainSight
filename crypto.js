"use strict";

/**
* Algorithm Parameters
*/
const kKDFAlgorithm = 'PBKDF2';
const kKDFSaltSize = 8;
const kKDFIterations = 4096;
const kKDFHash = 'SHA-256';
const kCipherAlgorithm = 'AES-GCM';
const kCipherKeySize = 256;
const kCipherIVSize = 96;
const kCipherTagSize = 128;

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

/**
 * Derives an encryption key and initialization vector from |password| using
 * |salt1| for the key and |salt2| for the iv. Each salt value should be at
 * least 8 bytes in length. The result is a dictionary with 'key' and 'iv'
 * ArrayBuffer values.
 *
 * @param {string} password
 * @param {ArrayBuffer} salt1
 * @param {ArrayBuffer} salt2
 * @return {Promise}
 */
function derive(password, salt1, salt2)
{
  var password_key = null;
  var derived_key = null;
  const password_array = str2ab(password);
  const algorithm = {name: kKDFAlgorithm};
  const usages = ['deriveBits', 'deriveKey'];
  const extractable = false;
  // Import the password as a 'key'
  console.log('import');
  return crypto.subtle.importKey('raw', password_array, algorithm, extractable, usages).then(function(result) {
    password_key = result;
    // Derive encryption key
    const derived_algorithm = {name: kCipherAlgorithm, length: kCipherKeySize};
    const derived_usages = ['encrypt', 'decrypt'];
    const params = {
      name: kKDFAlgorithm,
      salt: salt1,
      iterations: kKDFIterations,
      hash: {name: kKDFHash}
    };
    console.log('deriveKey');
    return crypto.subtle.deriveKey(params, password_key, derived_algorithm, extractable, derived_usages);
  }).then(function(result) {
    derived_key = result;
    // Derive iv
    const params = {
      name: kKDFAlgorithm,
      salt: salt2,
      iterations: kKDFIterations,
      hash: {name: kKDFHash}
    };
    console.log('deriveBits');
    return crypto.subtle.deriveBits(params, password_key, kCipherIVSize);
  }).then(function(derived_iv) {
    return {
      key: derived_key,
      iv: derived_iv
    };
  });
}

/**
 * Encrypts |plain_text| using a key derived from |password|. The result is the
 * ArrayBuffer cipher text.
 *
 * @param {string} password
 * @param {ArrayBuffer} plain_text
 * @return {Promise}
 */
function encrypt(password, plain_text)
{
  var salt1 = new Uint8Array(kKDFSaltSize);
  crypto.getRandomValues(salt1);
  var salt2 = new Uint8Array(kKDFSaltSize);
  crypto.getRandomValues(salt2);
  return derive(password, salt1, salt2).then(function(result) {
    const algorithm = {
      name: kCipherAlgorithm,
      iv: result.iv,
      tagLength: kCipherTagSize
    };
    console.log('encrypt');
    return crypto.subtle.encrypt(algorithm, result.key, plain_text);
  }).then(function(cipher_text) {
    // Concatenate salts with cipher_text.
    cipher_text = new Uint8Array(cipher_text);
    var final_output = new Uint8Array(cipher_text.length + 16);
    final_output.set(salt1, 0);
    final_output.set(salt2, 8);
    final_output.set(cipher_text, 16);
    return final_output;
  });
}

/**
 * Decrypts |cipher_text| using a key derived from |password|. The result is the
 * ArrayBuffer plain text.
 *
 * @param {string} password
 * @param {ArrayBuffer} cipher_text
 * @return {Promise}
 */
function decrypt(password, cipher_text)
{
  const salt1 = cipher_text.subarray(0, 8);
  const salt2 = cipher_text.subarray(8, 16);
  const raw_cipher_text = cipher_text.subarray(16);
  return derive(password, salt1, salt2).then(function(result) {
    const algorithm = {
      name: kCipherAlgorithm,
      iv: result.iv,
      tagLength: kCipherTagSize
    };
    console.log('decrypt');
    return crypto.subtle.decrypt(algorithm, result.key, raw_cipher_text);
  });
}

function testEncryptDecrypt()
{
  var password = 'test_password_345_%$#';
  var data = str2ab('test_data');
  encrypt(password, data).then(function(encrypted_data) {
    return decrypt(password, encrypted_data);
  }).then(function(decrypted_data) {
    console.log('decrypt finished')
    if (ab2str(decrypted_data) == 'test_data') {
      console.log('ENCRYPT/DECRYPT SUCCESS!');
    } else {
      console.log('ENCRYPT/DECRYPT FAIL!');
    }
  }, function(reason) {
    console.log('DECRYPT FAIL!');
    console.log(reason);
  });
}

function testEncryptDecryptFail()
{
  var password = 'test_password_345_%$#';
  var data = str2ab('test_data');
  encrypt(password, data).then(function(encrypted_data) {
    return decrypt('wrong password', encrypted_data);
  }).then(function(decrypted_data) {
    console.log('decrypt finished')
    if (ab2str(decrypted_data) == 'test_data') {
      console.log('ENCRYPT/DECRYPT SUCCESS!');
    } else {
      console.log('ENCRYPT/DECRYPT FAIL!');
    }
  }, function(reason) {
    console.log('DECRYPT FAIL!');
    console.log(reason);
  });
}

// testEncryptDecrypt();
// testEncryptDecryptFail();
