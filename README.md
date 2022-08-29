# Piece Buffer

[![npm version](https://badge.fury.io/js/piece-buffer.svg)](https://badge.fury.io/js/piece-buffer) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/brianduff/piece-buffer/piece-buffer)](https://github.com/brianduff/piece-buffer/actions)

This is a lightweight implementation of a Piece Buffer - an efficient data structure for storing and modifying text.

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

