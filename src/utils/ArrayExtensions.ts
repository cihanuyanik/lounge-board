declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Array<T> {
    /**
     * In place item removal at index.
     * Removes the item located at given index from the array.
     * @param index
     */
    removeAt(index: number): void;

    /**
     * Removes the item located at given index from the array and returns a new array.
     * @param index
     */
    toRemovedAt(index: number): T[];

    /**
     * In place item removal.
     * Removes the first occurrence of a specific object from the array.
     * @param item
     */
    remove(item: T): void;

    /**
     * Removes the first occurrence of a specific object from the array and returns a new array.
     * @param item
     */
    toRemoved(item: T): T[];

    /**
     * In place item removal.
     * Removes all occurrences of a specific object from the array.
     * @param item
     */
    removeAll(item: T): void;

    /**
     * Removes all occurrences of a specific object from the array and returns a new array.
     * @param item
     */
    toRemovedAll(item: T): T[];

    /**
     * In place item insertion.
     * Insert an item at the given index.
     * @param item
     * @param index
     */
    insert(item: T, index: number): void;

    /**
     * Insert an item at the given index and returns a new array.
     * @param item
     * @param index
     */
    toInserted(item: T, index: number): T[];

    /**
     * In place item move.
     * Move an item from one index to another.
     * @param from
     * @param to
     */
    move(from: number, to: number): void;

    /**
     * Move an item from one index to another and returns a new array.
     * @param from
     * @param to
     */
    toMoved(from: number, to: number): T[];
  }
}

Array.prototype.removeAt = function (index: number) {
  // Check boundaries
  if (index < 0 || index >= this.length) return;
  this.splice(index, 1);
};

Array.prototype.toRemovedAt = function (index: number) {
  const arr = [...this];
  arr.removeAt(index);
  return arr;
};

Array.prototype.remove = function (item: any) {
  const index = this.indexOf(item);
  this.removeAt(index);
};

Array.prototype.toRemoved = function (item: any) {
  const arr = [...this];
  arr.remove(item);
  return arr;
};

Array.prototype.removeAll = function (item: any) {
  let index = this.indexOf(item);
  while (index > -1) {
    this.removeAt(index);
    index = this.indexOf(item, index);
  }
};

Array.prototype.toRemovedAll = function (item: any) {
  const arr = [...this];
  arr.removeAll(item);
  return arr;
};

Array.prototype.insert = function (item: any, index: number) {
  // Check boundaries
  if (index < 0 || index > this.length) return;
  this.splice(index, 0, item);
};

Array.prototype.toInserted = function (item: any, index: number) {
  const arr = [...this];
  arr.insert(item, index);
  return arr;
};

Array.prototype.move = function (from: number, to: number) {
  // Check boundaries and equality of given indexes
  if (
    from === to ||
    from < 0 ||
    from >= this.length ||
    to < 0 ||
    to >= this.length
  )
    return;

  // Get item to be moved
  const item = this[from];
  // remove item from array
  this.removeAt(from);
  // insert item at new index
  this.insert(item, to);
};

Array.prototype.toMoved = function (from: number, to: number) {
  const arr = [...this];
  arr.move(from, to);
  return arr;
};

export {};
