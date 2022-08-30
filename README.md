# Piece Buffer

[![npm version](https://badge.fury.io/js/piece-buffer.svg)](https://badge.fury.io/js/piece-buffer) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/brianduff/piece-buffer/piece-buffer)](https://github.com/brianduff/piece-buffer/actions)

This is a lightweight implementation of a Piece Buffer - an efficient data structure for storing and modifying text. This is based on, and inspired by the ideas of VSCode's [Text Buffer Implementation](https://code.visualstudio.com/blogs/2018/03/23/text-buffer-reimplementation).

Note: this is usable, but it's an experimental side project for my own learning, not something that's intended to be necessarily used outside of other side projects. It still needs lots of optimization. Use at your own risk! :)

## Installation

To install with npm:

```bash
npm install piece-buffer
```

or yarn:

```bash
yarn add piece-buffer
```

## Basic usage

Here's a small example that creates an editor, inserts some text in the middle, and appends some text to the end.

```js
const pb = require("piece-buffer");
const editor = pb.createEditor("Hello World.");
editor.insert(6, "Cool ");
editor.append(" Goodbye!");
// Prints "Hello Cool World. Goodbye!"
console.log(editor.toString());
```

## Positions and lines

The Piece Buffer editor keeps track of lines in the text.

The main mutation operations of an editor (`delete()` and `insert()`) both take a position as the first parameter. This can simply be a character offset, or it can be a line and column number (both of which are zero-based).

For example:

```js
const pb = require("piece-buffer");
const editor = pb.createEditor("Hello\nPiece\nBuffer\n");
editor.insert({line: 1, column: 5}, "meal");
// Prints "Hello\nPiecemeal\nBuffer\n"
console.log(editor.toString());
```

It's convenient to iterate lines:

```js
const pb = require("piece-buffer");
const editor = pb.createEditor("Hello\nPiece\nBuffer\n");
// Prints:
// Hello
// Piece
// Buffer
for (const line of editor.lines()) {
  console.log(line)
}
```

It's also convenient to iterate lines matching an expression. The iterator will yield back an array containing the regular expression match array, the whole line that matched, and the line number:

```js
const pb = require("piece-buffer");
const editor = pb.createEditor("Hello\nPiece\nBuffer\n");
// Prints:
// Line 1 (Piece) matched: P
for (const line of editor.linesMatching(/^P/)) {
  console.log(`Line ${line[2]} (${line[1]}) matched: ${line[0][0]}`)
}
```


## Selections

Selections are a useful way to find and replace or delete parts of a document efficiently. They behave a lot like the cursor selection in a text editor.

```js
const pb = require("piece-buffer");
const editor = pb.createEditor("Hello World.");
const selection = editor.createSelection();
selection.selectFirst("World");
selection.replace("Piece Buffer");
// Prints "Hello Piece Buffer."
console.log(editor.toString());
```

TODO: more documentation

## Performance

TODO: Compare performance to basic strings, write up benchmark.


---
This is not an officially supported Google product.

