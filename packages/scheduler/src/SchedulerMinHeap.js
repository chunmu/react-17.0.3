/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

type Heap = Array<Node>;
type Node = {|
  id: number,
  sortIndex: number,
|};

// 最小堆排序
// taskQueue和timerQueue, 它们都是以最小堆的形式进行存储, 
// 这样就能保证以O(1)的时间复杂度, 取到数组顶端的对象(优先级最高的 task)

export function push(heap: Heap, node: Node): void {
  const index = heap.length;
  heap.push(node);
  siftUp(heap, node, index);
}

export function peek(heap: Heap): Node | null {
  return heap.length === 0 ? null : heap[0];
}

export function pop(heap: Heap): Node | null {
  if (heap.length === 0) {
    return null;
  }
  const first = heap[0];
  const last = heap.pop();
  if (last !== first) {
    heap[0] = last;
    siftDown(heap, last, 0);
  }
  return first;
}

// 插入处理
// 最小堆算法 找出父元素 比较大小 替换 保证顶层元素[0]最小
// 这边有个关键的点在于怎么找到父元素
//  8 => 1000 >>> 1 = 100 4
//  9 => 1001 >>> 1 = 100 4
// 根据上述特性 可以找到同一个父元素4  很明显他们不对

//               0
//         1          2
//       3   4      5    6
//      7 8 9 10  11 12 13 14  
// 所以8和9不是同一个parent  得到规律  1，2   3， 4   5，6  7，8  跟索引密切相关
// 如果我插入一个元素  那么  我要找到这个元素的索引  也就是旧数组的长度  假设在插入的时候旧的长度为7 || 8  索引应该在7 || 8的位置
// 7 => 111 >>> 1 = 11 = 3
// 8 => 1000 >>> 1 = 100 = 4
// 那就集体 - 1  让另一对数字行程右移一位值相同
// 也就是索引的位置本身的值 都-1来定位一对相同父元素的
// 7 - 1 => 110 >>> 1 = 11 = 3
// 8 - 1 => 111 >>> 1 = 11 = 3
// 7和8的父元素都是3  完成了找父元素位置的方法
// 然后和父元素比对 交换位置 确保顶层最小  最小堆
// 最小堆的概念是顶层元素最小
// 对应react应用场景就是  权限最高 优先级最高的任务放第一个
function siftUp(heap, node, i) {
  let index = i;
  while (index > 0) {
    const parentIndex = (index - 1) >>> 1; // 无符号右移1位 0的无符号右移是0
    const parent = heap[parentIndex];
    if (compare(parent, node) > 0) {
      // The parent is larger. Swap positions.
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      // The parent is smaller. Exit.
      return;
    }
  }
}

function siftDown(heap, node, i) {
  let index = i;
  const length = heap.length;
  const halfLength = length >>> 1;
  while (index < halfLength) {
    const leftIndex = (index + 1) * 2 - 1;
    const left = heap[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex];

    // If the left or right node is smaller, swap with the smaller of those.
    if (compare(left, node) < 0) {
      if (rightIndex < length && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (rightIndex < length && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      // Neither child is smaller. Exit.
      return;
    }
  }
}

function compare(a, b) {
  // Compare sort index first, then task id.
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
