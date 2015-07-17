'use strict'

var transformMathmode = require('../lib')

process.stdin
  .pipe(
    transformMathmode({
      inline:  function(tex, cb) { cb(  '<' + tex + '>'  ) },
      display: function(tex, cb) { cb( '<<' + tex + '>>' ) }
    })
  )
  .pipe( process.stdout )

