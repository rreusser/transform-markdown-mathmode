'use strict'

var through = require('through2')
  , split = require('split2')
  , combine = require('stream-combiner')
  , parserMachine = require('./machine')

module.exports = function( transformInline, transformDisplay ) {

  var fsm = parserMachine()

  function onChunk( chunk, enc, cb ) {
    fsm.newline( this, chunk.toString(), cb )
  }

  function onFlush( cb ) {
    fsm.flush( this, cb )
  }

  return combine( split(), through(onChunk,onFlush) )

}

