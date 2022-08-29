/* eslint-disable @typescript-eslint/no-var-requires */
// This is a simple example of using piece-buffer.

const pb = require("piece-buffer");
const editor = pb.createEditor("Hello World.");
const selection = editor.createSelection();
selection.selectFirst("World");
selection.replace("Piece Buffer");
// Prints "Hello Piece Buffer."
console.log(editor.toString());
