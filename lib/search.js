'use strict'

var delimiters = [
  { name: 'inline',    text: '$',   regex: /[^\\]\$/,   offset: 1 },
  { name: 'inline',    text: '$',   regex: /^\$/,       offset: 0 },
  { name: 'display',   text: '$$',  regex: /[^\\]\$\$/, offset: 1 },
  { name: 'display',   text: '$$',  regex: /^\$\$/,     offset: 0 },
  { name: 'verbatim',  text: '`',   regex: /[^\\]`/,    offset: 1 },
  { name: 'verbatim',  text: '`',   regex: /^`/,        offset: 0 },
  { name: 'verbatim',  text: '``',  regex: /[^\\]``/,   offset: 1 },
  { name: 'verbatim',  text: '``',  regex: /^``/,       offset: 0 },
  { name: 'block',     text: '```', regex: /^```/,      offset: 0 },
]

module.exports.next = function( str, startPos, allowedDelimiters ) {
  var hit, minhit = Infinity, sub=str.substr(startPos),
      result = {type: 'closed', pos: str.length, next: Infinity}

  delimiters.forEach(function(d) {
    if( allowedDelimiters && allowedDelimiters.indexOf(d.name)===-1 ) return
    if( (hit=sub.search(d.regex)) !== -1 && hit <= minhit) {
      minhit = hit
      var p = Math.max(0,hit + d.offset)
      result = {
        type: d.name,
        text: d.text,
        pos: p,
        next: p + d.text.length
      }
    }
  })

  return result
}
