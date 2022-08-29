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

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { LinkedList } from "./linkedlist";

test("Push and get elements back", () => {
  const list = new LinkedList(5);
  list.push(6);
  list.push(7);
  list.push(8);

  expect(list.toArray()).toEqual([5, 6, 7, 8]);
});

test("Insert after", () => {
  const list = LinkedList.fromArray([1, 2, 3, 4, 5]);
  list.insertAfter(list.getHead()?.next, 99);
  expect(list.toArray()).toEqual([1, 2, 99, 3, 4, 5]);
});

test("Insert after with undefined", () => {
  const list = LinkedList.fromArray([1, 2, 3, 4, 5]);
  list.insertAfter(undefined, 55);
  expect(list.toArray()).toEqual([55, 1, 2, 3, 4, 5]);
});

test("Insert after with undefined in empty list", () => {
  const list = new LinkedList<number>();
  list.insertAfter(undefined, 55);
  expect(list.toArray()).toEqual([55]);
});

test("Insert after tail", () => {
  const list = LinkedList.fromArray([1, 2, 3]);
  list.insertAfter(list.getTail(), 100);
  expect(list.toArray()).toEqual([1, 2, 3, 100]);
});

test("Remove head", () => {
  const list = LinkedList.fromArray([1, 2, 3]);
  list.removeNode(list.getHead()!);
  expect(list.toArray()).toEqual([2, 3]);
});

test("Remove tail", () => {
  const list = LinkedList.fromArray([1, 2, 3]);
  list.removeNode(list.getTail()!);
  expect(list.toArray()).toEqual([1, 2]);
});

test("Remove middle", () => {
  const list = LinkedList.fromArray([5, 6, 7]);
  list.removeNode(list.getHead()?.next!);
  expect(list.toArray()).toEqual([5, 7]);
});

test("Remove node range", () => {
  const list = LinkedList.fromArray([5, 6, 7, 8, 9, 10, 11, 12]);

  list.removeNodeRange(list.getHead()?.next, list.getTail()?.prev);

  expect(list.toArray()).toEqual([5, 12]);
});
