# transform-markdown-mathmode

Transform LaTeX equations asynchronously in a stream of markdown

## Introduction

This module takes a stream of [markdown](http://daringfireball.net/projects/markdown/syntax) and searches for basic patterns that look like equations, being careful to exclude escaped patterns or code blocks. It doesn't do any rendering itself, but takes transformation functions that may perform some synchronous or asynchronous action and return the result. This makes it easy to render equations, store them somewhere, and insert image tags into the resulting markdown.

## Installation

To install, run:

```bash
$ npm install transform-markdown-mathmode
```

## What it does

As hesitant as I was to parse a stream of markdown, this module uses a [finite state machine](https://en.wikipedia.org/wiki/Finite-state_machine) to track whether a couple different types of blocks are open or closed. I suspect it's probably possible (and wayyyy easier) to do this with a couple regexes, but the current complication comes from the need to track open equations across multiple lines of streamed text and the desire to avoid ugly escaping that would make it a total pain in the butt to paste fifty lines of jQuery code into your README. That's really all it's doing through. It's pretty simple, carefully tested, and allows simple escaping for corner cases. If there are cases that fail, let me know. If you can do this in five lines of code... I'm not sure I want to know...

The primary goal is to transform equations asynchronously while avoiding a bunch of ugly escaping and other workarounds. And to learn how to process streams in node. And write gulp plugins. And avoid typesetting equations in Github READMEs by hand.

## Example

This README is generated by passing `README.mdtex` through the parser. The sample configuration just transforms `$...$` into `<...>` and `$$...$$` into `<<...>>` so it's clear that it's working (FWIW: this line started out with all `$`'s):

```javascript
var transformMathmode = require('transform-markdown-mathmode')

process.stdin
  .pipe(
    transformMathmode({
      inline:  function(tex, cb) { cb(  '<' + tex + '>'  ) },
      display: function(tex, cb) { cb( '<<' + tex + '>>' ) }
    })
  )
  .pipe( process.stdout )

// Also, note that equations in code blocks don't get transformed,
// no escaping necessary! Hooray!
//
//   $y = x$
//
```

This is just invoked with:

```bash
$ cat README.mdtex | node example/transform.js > README.md
```

This transformation isn't particularly interesting, but it means you can perform an arbitrarily complicated asynchronous task each time you encounter an equation.

## Usage

#### `require('transform-markdown-mathmode')( options )`
Create a transform stream that performs the transformation.

- `options`: The options hash accepts two options:
  - `inline`: A function of format `function(tex, cb){...}` that receives a string of tex (with `$` delimiters stripped) and executes a callback containing the transformed inline equation. See above for example.
  - `display`: A function of format `function(tex, cb){...}` that receives a string of tex (with `$$` delimiters stripped) and executes a callback containing the transformed display equation. See above for example.

- **Returns**: The transform stream.

## License

(c) 2015 Ricky Reusser. MIT License