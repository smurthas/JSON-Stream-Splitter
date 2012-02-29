var express = require('express');
var expressStream = require('express-jsonstream');
var request = require('request');

var StreamSplitter = require('./index');

// add express-jsonstream middleware
var app = express.createServer(expressStream());

// listen for GETs, write out some objects
app.get('/stream-get', function(req, res) {
  res.jsonStream({small:'world'});
  res.jsonStream({after:'all'});
  res.end();
});

app.listen(12345);

// GET some JSON out of the streaming endpoint
StreamSplitter.splitStream(request('http://localhost:12345/stream-get'))
.on('object', console.log)
.on('error', console.error)
.on('end', process.exit);