'use strict'

var transformMarkdown = require('../lib')
  , fs = require('fs')

process.stdin
  .pipe( transformMarkdown() )
  .pipe( process.stdout )

