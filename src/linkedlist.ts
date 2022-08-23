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

export class Node<T> {
  prev?: Node<T>;
  next?: Node<T>;
  val: T;

  constructor(value: T) {
    this.val = value;
  }
}

export class LinkedList<T> {
  private head: Node<T> | undefined
  private tail: Node<T> | undefined

  constructor(headValue: T) {
    const head = new Node(headValue);
    this.head = head;
    this.tail = head;
  }

  createNode(value: T) {
    return new Node(value)
  }

  private insertNodeBefore(pos: Node<T>, node: Node<T>) {
    node.next = pos;
    node.prev = pos.prev;
    if (pos.prev) {
      pos.prev.next = node;
    } else {
      this.head = node;
    }
    pos.prev = node;
  }

  private insertNodeAfter(pos: Node<T>, node: Node<T>) {
    node.prev = pos;
    node.next = pos.next;
    if (pos.next) {
      pos.next.prev = node;
    } else {
      this.tail = node;
    }
    pos.next = node;
  }

  insertAfter(pos: Node<T> | undefined, value: T) {
    const node = this.createNode(value);
    if (!pos) {
      if (this.head) {
        this.insertNodeBefore(this.head, node);
      } else {
        this.head = node;
        this.tail = node;
      }
    } else {
      this.insertNodeAfter(pos, node);
    }
    return node;
  }

  removeNode(node: Node<T>) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  /**
   * Removes a range of contiguously connected nodes.
   */
  removeNodeRange(start?: Node<T>, end?: Node<T>) {
    // TODO: this could be optimized to just attach the beginning to the end.
    let from = start ?? this.head;
    const to = end ?? this.tail

    while (from) {
      const next = from.next;
      this.removeNode(from);
      if (from === to) {
        break;
      }
      from = next;
    }
  }

  private pushNode(node: Node<T>) {
    if (this.tail) {
      this.insertNodeAfter(this.tail, node);
    } else {
      this.head = node;
      this.tail = node;
    }
  }

  push(value: T) {
    this.pushNode(new Node(value))
  }

  getHead() {
    return this.head;
  }

  getTail() {
    return this.tail;
  }

  toArray() {
    const result = []
    let n: Node<T> | undefined = this.head;
    while (n) {
      result.push(n.val);
      n = n.next;
    }
    return result;
  }
}

