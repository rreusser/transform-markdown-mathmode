'use strict'

var fs = require('fs')
  , lmm = require('./')
  , split = require('split2')
  , through = require('through2')

fs.createReadStream('test/fixtures/valid/inline-equation.mdtex')
  .pipe( lmm() )

