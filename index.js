var EventEmitter = require('events').EventEmitter;

function RemnantError(remnant) {
  this.name = 'RemnantError'
  this.message = 'There was data remaining on a JSON stream.'
  this.remnant = remnant;
}
RemnantError.prototype = new Error();
RemnantError.prototype.constructor = RemnantError;

module.exports.splitStream = function(stream, cbEach, cbDone) {
  var incomingData = '';
  var ee = new EventEmitter();
  stream.on('data', function(data) {
    incomingData += data.toString('utf8');
    var chunks = incomingData.split('\n');
    // The last one will always have the last bit or empty
    incomingData = chunks[chunks.length - 1];
    // Iterate over all but the last one, handled above
    for (var i = 0; i < chunks.length - 1; i++) {
      try {
        var obj = JSON.parse(chunks[i]);
        ee.emit('object', obj);
      } catch (err) {
        ee.emit('error', err);
      }
    }
  });
  stream.on('end', function() {
    if (incomingData) ee.emit(new RemnantError(incomingData));
    ee.emit('end');
  });

  stream.on('response', function(resp) {
    ee.emit('response', resp);
  });

  return ee;
}