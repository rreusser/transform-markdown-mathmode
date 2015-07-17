'use strict'

var machina = require('machina')
  , search = require('./search')

module.exports = stateMachineFactory

function makeSubstitutions(subs, str) {
  subs.forEach(function(sub) {
    str = str.replace(sub.pattern,sub.replacement)
  })
  return str
}

var parserMachine = machina.Fsm.extend({
  namespace: 'parser',
  initialState: 'idle',

  blockType: undefined,

  transform: {
    inline:  function(tex, cb) { cb("$"+tex+"$") },
    display: function(tex, cb) { cb("$$"+tex+"$$") },
    verbatim: function(x, cb) { cb("`"+x+"`") },
    block: function(x, cb) { cb("```"+x+"```") }
  },

  substitutions: [
    { pattern: /\\\$\$/g, replacement: '$$' },
    { pattern: /\\\$/g, replacement: '$' },
    { pattern: /\\`/g, replacement: '`' },
    { pattern: /\\``/g, replacement: '``' }
  ],

  line: {
    text: '',
    pos: undefined,
    buffer: undefined,
  },

  newline: function( stream, text, cb ) {
    this.line.pos = 0
    this.line.text = text
    this.stream = stream
    this.cb = cb

    this.handle('newline')
  },

  // EOL is the magic line terminator that sends us back to the through2
  // stream parser:
  // Flush only happens when we hit the end of the stream:
  flush: function( stream, cb ) {
    if( this.state==='open' && this.openDelimiterText) stream.push( this.openDelimiterText )
    if( this.buffer && this.buffer.length > 0 ) stream.push(this.buffer)
    this.transition('idle')
    cb()
  },

  states: {

    idle: { newline: 'closed' },

    // This is the default state: just scanning text, no open blocks:
    closed: {

      // When we enter this state, mark the current block type as closed
      // and trigger search:
      _onEnter: function() {
        this.blockType = 'closed'
        this.handle('search')
      },

      // On newline while scanning for opening delimiters, just push a '\n' to the
      // stream and start searching the new line of text:
      newline: function() {
        this.stream.push('\n')
        this.handle('search')
      },

      // Search for an opening delimiter of any type:
      search: function() {
        var result = search.next( this.line.text, this.line.pos )
        this.blockType = result.type

        // Push the string from the previous position to the delimiter or EOL:
        this.stream.push(
          makeSubstitutions( this.substitutions,
            this.line.text.substr( this.line.pos, result.pos )
          )
        )

        // Store the delimiter text in case we get to the end of file and we don't
        // know what to do with an unclosed block -- in other words, we'll let
        // markdown worry about unclosed blocks and just make sure we don't fail
        // or drop a bunch of text.
        this.openDelimiterText = this.line.text.substr( result.pos, result.next-result.pos )

        // Shift line pos to what was found:
        this.line.pos += result.next

        // If opening delim on this line, transition, otherwise EOL and next line:
        result.next < Infinity ?  this.transition('open') : this.cb()
      }
    },

    // Block is open: search the current line at the current position for
    // a closing delimiter
    open: {
      _onEnter: function() {
        this.buffer = ''
        this.handle('search')
      },

      // When a newline happens while block is open, add a line to the buffer
      // and start searching the current line:
      newline: function() {
        this.buffer += '\n'
        this.handle('search')
      },

      search: function() {

        // Search the text for the closing delimiter of the currently open block:
        var result = search.next( this.line.text, this.line.pos, [this.blockType] )
        this.buffer += this.line.text.substr( this.line.pos, result.pos )
        this.line.pos += result.next

        if( result.next < Infinity ) {
          // If the open block terminates on the current line, asynchronously compute
          // the transformed block, flush it to the buffer, then cycle back to the
          // 'closed' state.
          this.transform[this.blockType](this.buffer,function(output) {
            this.stream.push(output)
            this.buffer = undefined
            this.openDelimiterText = undefined
            this.transition('closed')
          }.bind(this))

        } else {
          // Otherwise, the block doesn't terminate on this line, so append the text
          // to the buffer and eol:
          this.cb()
        }
      }
    }

  }

})

// A wrapper that just feeds a couple options into the module since it's more convenient
// than trying to do a deep merge or something to get the options in the right place.
// Not really necessary.
function stateMachineFactory( opts ) {
  opts = opts || {}

  var m = new parserMachine()
  if( opts.inline ) m.transform.inline = opts.inline
  if( opts.display ) m.transform.display = opts.display
  return m
}
