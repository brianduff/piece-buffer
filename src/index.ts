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

import { LinkedList, Node } from "./linkedlist";

interface Piece {
  buffer: "original" | "add",
  offset: number,
  length: number
}

export type Offset = number;
export interface LineAndColumn {
  line: number;
  column: number;
}

export type Position = Offset | LineAndColumn;
type PieceNode = Node<Piece>;

type LineAndLineNumber = [string, number];
export type MatchLineAndLineNumber = [RegExpMatchArray, string, number];

export interface TextEditor {
  delete: (pos: Position, len: number) => void;
  insert: (pos: Position, text: string) => void;
  append: (text: string) => void;
  toString: () => string;
  lines: (start?: number, pattern?: RegExp) => Iterable<LineAndLineNumber>;
  linesMatching: (pattern: RegExp, start?: number) => Iterable<MatchLineAndLineNumber>;
  countLines(): number;
  createSelection(): Selection;
  isDirty: boolean;
  length: number;
}

export function createEditor(text: string): TextEditor {
  return new PieceTextEditor(text);
}

class PieceTextEditor implements TextEditor {
  file: string;
  add = "";
  table: LinkedList<Piece>
  version: number = 0;
  private _length: number;
  private _snapshot: undefined | string;

  constructor(text: string) {
    this.file = text;
    this.table = new LinkedList({
      buffer: "original",
      offset: 0,
      length: text.length
    })
    this._length = text.length;
  }

  get isDirty() {
    return this.toString() !== this.file
  }

  get length() {
    return this._length;
  }

  /**
   * Invokes a write function. The function should return the number of characters added or removed
   * (positive or negative).
   */
  private write(writeFunction: () => number) {
    this._snapshot = undefined;
    this.version++;
    const delta = writeFunction();
    this._length += delta;
    return delta;
  }

  /**
   * Splits a node at the given offset. If this results in an empty node, then prune it.
   * Always returns a pair of the node before and the node after the split, though either of
   * these could be undefined.
   * @param node
   * @param offset
   */
  private split(node: PieceNode, offset: number) {
    const beforeLength = offset;
    const afterLength = node.val.length - offset;
    var beforeSplit: PieceNode | undefined = node;
    var afterSplit = undefined;

    if (afterLength > 0) {
      afterSplit = this.table.insertAfter(node, {
        buffer: node.val.buffer,
        offset: node.val.offset + offset,
        length: afterLength
      })
    }

    if (beforeLength === 0) {
      this.table.removeNode(node);
      beforeSplit = undefined;
    } else {
      node.val.length = offset;
    }

    return [beforeSplit, afterSplit]
  }

  private getBuffer(piece: Piece) {
    return piece.buffer === "original" ? this.file : this.add;
  }

  toString() {
    if (this._snapshot) {
      return this._snapshot;
    }
    let text = "";
    let node = this.table.getHead()
    while (node !== undefined) {
      text += this.getText(node);
      node = node.next;
    }

    this._snapshot = text;

    return text;
  }

  createSelection(): Selection {
    return new Selection(this);
  }

  lines(start?: number): Iterable<LineAndLineNumber> {
    return iterable(() => new LineIterator(this, start))
  }

  linesMatching(pattern: RegExp, start?: number): Iterable<MatchLineAndLineNumber> {
    return iterable(() => new LineIteratorWithPattern(this, pattern, start));
  }

  countLines() {
    var count = 0;
    for (var _ of this.lines()) {
      count++;
    }
    return count;
  }

  private getText(node?: Node<Piece>) {
    if (node) {
      return this.getBuffer(node.val).substring(node.val.offset, node.val.offset + node.val.length);
    }
    return ""
  }

  private clearSnapshot() {
    this._snapshot = undefined;
  }

  delete(pos: Position, len: number) {
    if (len <= 0) {
      return;
    }

    this.write(() => {
      const start = this.locate(pos);
      if (!start) throw new Error("Index out of bounds: pos=" + pos + " len=" + len)

      var [_, deleteStart] = this.split(start.node, start.offset);

      const end = this.locate(start.offset + len)
      if (!end) throw new Error("Index out of bounds: pos=" + pos + " len=" + len)
      var [deleteEnd, _] = this.split(end.node, end.offset);

      this.table.removeNodeRange(deleteStart, deleteEnd);
      return -len;
    });
  }

  append(text: string) {
    return this.write(() => {
      var offset = this.add.length;
      this.add += text

      this.table.insertAfter(this.table.getTail(), {
        buffer: "add",
        offset,
        length: text.length
      })
      return text.length;
    })
  }

  insert(pos: Position, text: string) {
    if (text.length === 0) {
      return;
    }

    this.write(() => {
      const locator = this.locate(pos);

      // Handle the special case of inserting on the last line and inserting
      // a newline automatically.
      if (!locator && 'object' === typeof pos && 'column' in pos) {
        let lineAndColumn = pos as LineAndColumn;
        if (lineAndColumn.column === 0) {
          return this.append("\n" + text);
        }
      }

      if (!locator) {
        throw new Error("Index out of bounds: " + pos)
      }

      const offset = this.add.length;
      this.add = this.add + text

      const prefixNode = locator.node;
      prefixNode.val.length = locator.offset;

      const [beforeNode, _] = this.split(locator.node, locator.offset);

      this.table.insertAfter(beforeNode, {
        buffer: "add",
        offset,
        length: text.length
      });
      return text.length;
    })
  }

  /**
   * Given a position, returns a PieceLocator indicating the piece that contains
   * this offset, and the offset within that piece.
   */
  private locate(pos: Position) {
    let offset = this.toOffset(pos);

    if (offset) {
      var p = this.table.getHead();
      var docOffset = 0;
      while (p !== undefined) {
        var endOffset = docOffset + p.val.length;
        if (offset >= docOffset && offset <= endOffset) {
          return {
            node: p,
            offset: offset - docOffset
          }
        }
        docOffset = endOffset;
        p = p.next;
      }
    }
  }

  toOffset(pos: Position) {
    if (typeof pos === "number") {
      return pos as number;
    }
    return this.lineAndColumnToOffset(pos as LineAndColumn);
  }

  lineAndColumnToOffset(loc: LineAndColumn) {
    // TODO: do this more efficiently / keep a line number table.

    if (loc.line === 0 && loc.column === 0) {
      return 0;
    }

    let line = 0;
    let col = 0;
    let charOffset = 0;
    let node = this.table.getHead();
    while (node) {
      let text = this.getText(node);
      for (var i = 0; i < text.length; i++) {
        if (loc.line === line && loc.column === col) {
          return charOffset;
        }
        if (text.charAt(i) === '\n') {
          line++;
          col = 0;
        } else {
          col++;
        }
        charOffset++;
      }
      node = node.next;
    }

    if (line == loc.line && col === loc.column) {
      return charOffset;
    }
  }
}

class LineIteratorWithPattern implements Iterator<MatchLineAndLineNumber> {
  private baseIterator: LineIterator;
  private pattern: RegExp;

  constructor(editor: PieceTextEditor, pattern: RegExp, start?: number,) {
    this.baseIterator = new LineIterator(editor, start);
    this.pattern = pattern;
  }

  next(): IteratorResult<MatchLineAndLineNumber> {
    var baseResult = this.baseIterator.next();

    while (!baseResult.done) {
      const [line, number] = baseResult.value;
      const match = line.match(this.pattern);
      if (match) {
        return {
          done: false,
          value: [match, line, number]
        }
      }
      baseResult = this.baseIterator.next();
    }

    return {
      done: true,
      value: null
    }
  }
}

class LineIterator implements Iterator<LineAndLineNumber> {
  private textSnapshot: string;
  private charPos = 0;
  private line = 0;
  private nextLine?: LineAndLineNumber;
  private eof = false;

  constructor(editor: PieceTextEditor, start?: number) {
    // This could be more efficient if it didn't take a snapshot. But KISS.
    this.textSnapshot = editor.toString();
    this.eof = false;
    if (this.textSnapshot.length !== 0) {
      if (start && start > 0) {
        this.skipLines(start);
      }
    }
  }

  private findNextLine() {
    if (this.eof) {
      this.nextLine = undefined;
      return;
    }
    var startOfCurrentLine = this.charPos;
    var endOfCurrentLine;
    for (; this.charPos < this.textSnapshot.length; this.charPos++) {
      if (this.textSnapshot.charAt(this.charPos) === '\n') {
        endOfCurrentLine = this.charPos;
        // Skip past the newline
        this.charPos++;
        break;
      }
    }
    if (endOfCurrentLine === undefined) {
      endOfCurrentLine = this.textSnapshot.length;
      this.eof = true;
    }

    this.nextLine = [this.textSnapshot.substring(startOfCurrentLine, endOfCurrentLine), this.line];
    this.line++;
  }

  private skipLines(count: number) {
    repeat(count, () => this.findNextLine());
  }

  next() {
    this.findNextLine();

    return {
      value: this.nextLine as LineAndLineNumber,
      done: this.nextLine === undefined
    }
  }
}

/**
 * Selection provides an abstraction for selecting parts of the document based on
 * string or regular expression matching. A selection can be deleted or
 * replaced (effectively deleting and then inserting at the old beginning of the
 * selection).
 *
 * A selection is only valid while the document is not being modified. On mutation,
 * the selection becomes unusable.
 */
class Selection {
  private editor: PieceTextEditor
  private text: string
  private version: number

  // TODO: we could model discontiguous selections. Is that useful?
  private offset?: number
  private length: number = 0

  constructor(editor: PieceTextEditor) {
    this.editor = editor;
    this.text = editor.toString();
    this.version = editor.version;
  }

  private checkVersion() {
    if (this.version !== this.editor.version) {
      throw new Error("Editor modified. Selection no longer valid")
    }
  }

  /**
   * Directly selects the given offset and length, clearing the existing
   * selection.
   */
  select(position: Position, length: number) {
    this.checkVersion();
    const offset = this.editor.toOffset(position);
    if (offset === undefined) {
      throw new Error("Invalid position: " + JSON.stringify(position))
    }
    this.offset = this.editor.toOffset(position);
    this.length = length;
  }

  /**
   * Expands the selection backwards or forwards to include the given position.
   */
  expand(position: Position) {
    this.checkVersion();

    var newOffset = this.editor.toOffset(position);
    if (newOffset && this.offset && newOffset < this.offset) {
      var diff = this.offset - newOffset;
      this.offset = newOffset;
      this.length += diff;
    } else if (newOffset && this.offset && newOffset > this.offset + this.length) {
      var diff = newOffset - (this.offset + this.length);
      this.length += diff;
    }
  }

  /**
   * Deletes the selection. This also invalidates the current selection.
   */
  delete() {
    this.checkVersion();
    if (this.offset && this.length > 0) {
      this.editor.delete(this.offset, this.length);
    }
  }

  /**
   * Replaces the selection. This also invalidates the current selection.
   */
  replace(text: string) {
    this.checkVersion();
    if (this.offset && this.length > 0) {
      this.editor.delete(this.offset, this.length);
    }
    if (this.offset) {
      this.editor.insert(this.offset, text);
    }
  }

  /**
   * Selects the first match of the given regexp.
   */
  selectFirst(expression: string | RegExp) {
    this.checkVersion();
    const found = this.text.match(expression);
    if (found && found.index && found[0]) {
      this.select(found.index, found[0].length);
      return true;
    }
    return false;
  }

  /**
   * Expands the selection forward to include a subsequent pattern. If the
   * pattern isn't found, returns false.
   */
  expandForward(expression: string | RegExp) {
    this.checkVersion();

    if (this.offset === undefined) {
      throw new Error("No current selection")
    }

    const start = this.offset + this.length;
    const found = this.text.substring(start).match(expression);
    if (found && found.index && found[0]) {
      const endPos = start + found.index + found[0].length;
      const lengthDelta = endPos - start;
      this.length += lengthDelta;
      return true;
    }

    return false;
  }

  /**
   * Expands the selection forward until a pattern is encountered, but does not
   * include the pattern in the selection.
   */
  expandUntil(expression: string | RegExp) {
    this.checkVersion();

    if (this.offset === undefined) {
      throw new Error("No current selection")
    }

    const start = this.offset + this.length;
    const found = this.text.substring(start).match(expression);
    if (found && found.index && found[0]) {
      const endPos = start + found.index;
      const lengthDelta = endPos - start;
      this.length += lengthDelta;
      return true;
    }

    return false;
  }

  /**
   * Expands the selection to the end of the document.
   */
  expandToEnd() {
    this.checkVersion();

    if (this.offset === undefined) {
      throw new Error("No current selection")
    }
    const docLength = this.editor.length;
    const remaining = docLength - (this.offset + this.length)

    this.length += remaining;
  }
}

function repeat(n: number, f: any) {
  while (n-- > 0) f();
}

function iterable<T>(createIterator: () => Iterator<T>): Iterable<T> {
  return new class implements Iterable<T> {
    [Symbol.iterator](): Iterator<T> {
      return createIterator();
    }
  }
}