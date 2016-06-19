// Initialise stego.
var models = {};
var stego = new MarkovTextStego();
var codec = new stego.Codec(null);
// Focus on input textarea.
$('#input-text').focus();
// When corpus selector changes:
$('#corpus-selector').change(function () {
  if ($('#corpus-selector').val() === 'custom') {
    $('#input-corpus').attr('disabled', false).focus();
  } else {
    $('#input-corpus').attr('disabled', true);
  }
});
// Disable encode/decode button when there is nothing to process.
$('#input-text').bind('input propertychange', function (e) {
  if ($('#input-text').val()) {
    $('#encode-text').button('reset');
  } else {
    $('#encode-text').attr('disabled', true);
  }
});
$('#output-text').bind('input propertychange', function (e) {
  if ($('#output-text').val()) {
    $('#decode-text').button('reset');
  } else {
    $('#decode-text').attr('disabled', true);
  }
});
// When "Encode Text" button is clicked:
$('#encode-text').click(function () {
  // Change button state.
  $('#encode-text').button('loading');
  $('#decode-text').attr('disabled', false);
  // Create or set ngramModel.
  var corpusOption = $('#corpus-selector').val();
  if (corpusOption === 'custom') {
    if (models.hasOwnProperty(corpusOption)) {
      delete models[corpusOption];
    }
    models[corpusOption] = new stego.NGramModel(1);
    try {
      models[corpusOption].import([$('#input-corpus').val()]);
    } catch (e) {
      if (e instanceof stego.NGramModelException) {
        alert('Invalid corpus specified. See limitations.\n\n' +
              'Error message: ' + e.message);
        // Reset button state.
        $('#decode-text').text('Decode Text');
        $('#encode-text').button('reset');
        return;
      }
    }
  } else {
    if (!models.hasOwnProperty(corpusOption)) {
      models[corpusOption] = new stego.NGramModel(1);
      models[corpusOption].import(corpora[corpusOption]);
    }
  }
  codec.setModel(models[corpusOption]);
  // Encode text.
  try {
    var password = $('#passphrase').val();
    var str = $('#input-text').val();
    str = LZString.compressToUint8Array(str);
    encrypt(password, str).then(function(encrypted_data) {
      $('#output-text').val(codec.encode(encrypted_data));
    })
  } catch (e) {
    if (e instanceof stego.CodecException) {
      alert('Could not encode data.\n\n' +
            'Error message: ' + e.message);
      // Reset button state.
      $('#encode-text').text('Encode Text');
      $('#decode-text').button('reset');
      return;
    }
  }
  // Reset input text.
  $('#input-text').val('');
  // Reset button state.
  $('#encode-text').text('Encode Text');
  $('#decode-text').button('reset');
});
// When "Decode Text" button is clicked:
$('#decode-text').click(function () {
  // Change button state.
  $('#decode-text').button('loading');
  // Create or set ngramModel.
  var corpusOption = $('#corpus-selector').val();
  if (corpusOption === 'custom') {
    if (models.hasOwnProperty(corpusOption)) {
      delete models[corpusOption];
    }
    models[corpusOption] = new stego.NGramModel(1);
    try {
      models[corpusOption].import([$('#input-corpus').val()]);
    } catch (e) {
      if (e instanceof stego.NGramModelException) {
        alert('Invalid corpus specified. See limitations.\n\n' +
              'Error message: ' + e.message);
        // Reset button state.
        $('#decode-text').text('Decode Text');
        $('#encode-text').button('reset');
        return;
      }
    }
  } else {
    if (!models.hasOwnProperty(corpusOption)) {
      models[corpusOption] = new stego.NGramModel(1);
      models[corpusOption].import(corpora[corpusOption]);
    }
  }
  codec.setModel(models[corpusOption]);
  // Decode text.
  try {
    var password = $('#passphrase').val();
    str = codec.decode($.trim($('#output-text').val()));
    decrypt(password, new Uint8Array(str)).then(function(decrypted_data) {
      decrypted_data = new Uint8Array(decrypted_data);
      str = LZString.decompressFromUint8Array(decrypted_data);
      $('#input-text').val(str);
    });
  } catch (e) {
    if (e instanceof stego.CodecException) {
      alert('Could not decode text.\n\n' +
            'Error message: ' + e.message);
      // Reset button state.
      $('#encode-text').text('Encode Text');
      $('#decode-text').button('reset');
      return;
    }
  }
  // Reset output text.
  $('#output-text').val('');
  // Reset button state.
  $('#decode-text').text('Decode Text');
  $('#encode-text').button('reset');
});
