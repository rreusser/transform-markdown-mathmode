'use strict'

var through = require('through2')
  , chunkString = require('./lib/chunk-string')
  , split = require('split2')
  , combine = require('stream-combiner')
  , parserMachine = require('./state-machine')

module.exports = function( transformInline, transformDisplay ) {

  var fsm = parserMachine()

  function onChunk( chunk, enc, cb ) {
    fsm.newline( chunk.toString(), this, cb )
  }

  function onFlush( cb ) {
    fsm.flush( this, cb )
  }

  return combine( split(), through(onChunk,onFlush) )

}

