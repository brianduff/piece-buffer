/* eslint-disable @typescript-eslint/no-var-requires */
// This is a simple example of using piece-buffer.

const pb = require("piece-buffer");
const editor = pb.createEditor("Hello World.");
editor.insert(6, "Cool ");
editor.append(" Goodbye!");
// Prints "Hello Cool World. Goodbye!"
console.log(editor.toString());
