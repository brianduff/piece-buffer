// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This is a test.

import { createEditor } from ".";

test("Create editor returns original string", () => {
  const editor = createEditor("Hello World!");
  expect(editor.toString()).toBe("Hello World!");
});

test("Count lines", () => {
  const text = `One
  Two
  Three
  Four
  Five`;

  const editor = createEditor(text);
  expect(editor.lineCount).toBe(5);
});

const text = `One
Potato
Two Potatoes`;

test("Insert on last line", () => {
  const editor = createEditor(text);
  editor.insert({ line: 3, column: 0 }, "Moar things");
  expect(editor.toString()).toMatch("Two Potatoes\nMoar things");
});

test("Insert on last line twice", () => {
  const editor = createEditor(text);
  editor.insert({ line: 3, column: 0 }, "Moar things");
  editor.insert({ line: 4, column: 0 }, "Even Moar things");
  expect(editor.toString()).toMatch(
    "Two Potatoes\nMoar things\nEven Moar things"
  );
});

test("Simple selection", () => {
  const editor = createEditor(text);
  const selection = editor.createSelection();
  selection.selectFirst("Potato");
  selection.replace("Tomato");
  expect(editor.toString()).toEqual("One\nTomato\nTwo Potatoes");
});

const markdown = `
# Hello

## World

- One
- Two
- Three

## Another

Hello there!
`;

test("Selection expansion", () => {
  const editor = createEditor(markdown);
  const selection = editor.createSelection();
  selection.selectFirst("# Hello");
  selection.expandForward("## World");

  let found = selection.expandForward(/- .+/);
  while (found) {
    found = selection.expandForward(/- .+/);
  }

  selection.replace("Turnip!");
  expect(editor.toString()).toEqual(
    "\nTurnip!\n\n## Another\n\nHello there!\n"
  );
});

test("Select on last line", () => {
  const editor = createEditor("Hello\n");
  const selection = editor.createSelection();
  // We shouldn't get an invalid position error from this.
  selection.select({ line: 1, column: 0 }, 0);
});

test("Selection expand until", () => {
  const editor = createEditor(markdown);
  const selection = editor.createSelection();
  selection.selectFirst("## World");
  selection.expandUntil("## Another");
  selection.replace("## Place\n");
  expect(editor.toString()).toEqual(
    "\n# Hello\n\n## Place\n## Another\n\nHello there!\n"
  );
});

test("Sample works", () => {
  const editor = createEditor("Hello World.");
  editor.insert(6, "Cool ");
  editor.append(" Goodbye!");
  expect(editor.toString()).toEqual("Hello Cool World. Goodbye!");
});

test("Line and column position sample works", () => {
  const editor = createEditor("Hello\nPiece\nBuffer\n");
  editor.insert({ line: 1, column: 5 }, "meal");
  expect(editor.toString()).toEqual("Hello\nPiecemeal\nBuffer\n");
});

test("Selection sample works", () => {
  const editor = createEditor("Hello World.");
  const selection = editor.createSelection();
  selection.selectFirst("World");
  selection.replace("Piece Buffer");
  expect(editor.toString()).toEqual("Hello Piece Buffer.");
});

test("Sample iterate lines", () => {
  const editor = createEditor("Hello\nPiece\nBuffer\n");
  const arr = [];
  for (const line of editor.lines()) {
    arr.push(line);
  }
  expect(arr).toEqual(["Hello", "Piece", "Buffer", ""]);
});

test("Sample iterate linesMatching", () => {
  const editor = createEditor("Hello\nPiece\nBuffer\n");
  const arr = [];
  for (const line of editor.linesMatching(/^P/)) {
    arr.push(`Line ${line[2]} (${line[1]}) matched: ${line[0][0]}`);
  }
  expect(arr).toEqual(["Line 1 (Piece) matched: P"]);
});
