# Piece Buffer

[![npm version](https://badge.fury.io/js/piece-buffer.svg)](https://badge.fury.io/js/piece-buffer) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/brianduff/piece-buffer/piece-buffer)

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

TODO: document selections.

## Performance

TODO: Compare performance to basic strings.

---
This is not an officially supported Google product.

