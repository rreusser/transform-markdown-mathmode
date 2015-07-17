'use strict'

var test = require('tape')
  , tmm = require('../lib')
  , Stream = require('stream')

var tapSpec = require('tap-spec');

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);

var transformInline  = function(str,cb) {
  setTimeout(function() {
    cb( '<' + str + '>' )
  },10)
}
var transformDisplay = function(str,cb) {
  setTimeout(function() {
    cb('<<' + str + '>>')
  },10)
}

function parseString(str,done) {
  var outputBuffer = ''
  var output = new Stream.Writable()

  var input = new Stream.Readable()
  input._read = function noop(){}
  input.push(str)
  input.push(null)

  input.pipe(tmm(transformInline,transformDisplay)).pipe(output)

  output._write = function(chunk,enc,cb) {
    outputBuffer += chunk
    cb()
  }
  output.on('error',function(err) {
    throw new Error(err)
  })
  output.on('finish',function() {
    done(outputBuffer)
  })
}

test('transforms inline equations',function(t) {
  parseString('test $y=x$ equation',function(result) {
    t.equal(result,'test <y=x> equation')
    t.end()
  })
})

test('transforms inline equations at the beginning of line',function(t) {
  parseString('$y=x$ equation',function(result) {
    t.equal(result,'<y=x> equation')
    t.end()
  })
})

test('transforms display equations',function(t) {
  parseString('test $$y=x$$ equation',function(result) {
    t.equal(result,'test <<y=x>> equation')
    t.end()
  })
})

test('transforms display equations at the beginning of line',function(t) {
  parseString('$$y=x$$ equation',function(result) {
    t.equal(result,'<<y=x>> equation')
    t.end()
  })
})

test('transforms multiple equations on one line',function(t) {
  parseString('test $$y=x$$ equation and $y=z$ another',function(result) {
    t.equal(result,'test <<y=x>> equation and <y=z> another')
    t.end()
  })
})

test("doesn't mangle paragraphs of text",function(t) {
  parseString('Lorem ipsum\ndolor sit\n\namet I don\'t\nremember the rest.',function(result) {
    t.equal(result,'Lorem ipsum\ndolor sit\n\namet I don\'t\nremember the rest.')
    t.end()
  })
})
test('transforms multi-line equations',function(t) {
  parseString('test $$\ny=x\n+7\n+4\n$$ equation and $\ny=z\n$ another',function(result) {
    t.equal(result,'test <<\ny=x\n+7\n+4\n>> equation and <\ny=z\n> another')
    t.end()
  })
})

test("doesn't transform inline equations in verbatim",function(t) {
  parseString('test `$y=x$` equation',function(result) {
    t.equal(result,'test `$y=x$` equation')
    t.end()
  })
})

test("doesn't mangle verbatim at beginning of line",function(t) {
  parseString('`$y=x$` equation',function(result) {
    t.equal(result,'`$y=x$` equation')
    t.end()
  })
})

test("doesn't transform display equations in verbatim",function(t) {
  parseString('test `$$y=x$$` equation',function(result) {
    t.equal(result,'test `$$y=x$$` equation')
    t.end()
  })
})

test("doesn't mangle multi-line verbatim",function(t) {
  parseString('Lorem ipsum `code()$$\n$${}` dolor sit amet.',function(result) {
    t.equal(result,'Lorem ipsum `code()$$\n$${}` dolor sit amet.')
    t.end()
  })
})

test("doesn't mangle paragraphs of text",function(t) {
  parseString('Lorem ipsum\ndolor sit\n\namet I don\'t\nremember the rest.',function(result) {
    t.equal(result,'Lorem ipsum\ndolor sit\n\namet I don\'t\nremember the rest.')
    t.end()
  })
})


test('ignores equations in code blocks',function(t) {
  parseString('test\n\n```javascipt\nthis.that=5\n$y=x$\n$$y=z$$\n```\n\nMore text.',function(result) {
    t.equal(result,'test\n\n```javascipt\nthis.that=5\n$y=x$\n$$y=z$$\n```\n\nMore text.')
    t.end()
  })
})

test('leaaves unclosed inline unaltered',function(t) {
  parseString('test $y=x equation',function(result) {
    t.equal(result,'test $y=x equation')
    t.end()
  })
})

test('leaves unclosed display unaltered',function(t) {
  parseString('test $$y=x equation',function(result) {
    t.equal(result,'test $$y=x equation')
    t.end()
  })
})

test('leaves unclosed verbatim unaltered',function(t) {
  parseString('test `verbatim',function(result) {
    t.equal(result,'test `verbatim')
    t.end()
  })
})

test('unescapes dollar signs',function(t) {
  parseString('test \\$5.00 $y=x$',function(result) {
    t.equal(result,'test $5.00 <y=x>')
    t.end()
  })
})

test('transforms inline equations asynchronously',function(t) {

  parseString('test $y=x$ equation',function(result) {
    t.equal(result,'test <y=x> equation')
    t.end()
  })
})

test('handles weird corner cases',function(t) {
  parseString("to \\$\\`$y = x$\\`\\$ and display equations like \\`$$y = x$$\\`.",function(result) {
    t.equal(result,"to $`<y = x>`$ and display equations like `<<y = x>>`.")
    t.end()
  })
})
