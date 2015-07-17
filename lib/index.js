'use strict'

var through = require('through2')
  , split = require('split2')
  , combine = require('stream-combiner')
  , parser = require('./parser')

module.exports = function(opts) {

  var fsm = parser(opts)

  function onChunk( chunk, enc, cb ) {
    fsm.newline( this, chunk.toString(), cb )
  }

  function onFlush( cb ) {
    fsm.flush( this, cb )
  }

  return combine( split(), through(onChunk,onFlush) )

}

