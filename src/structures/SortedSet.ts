import {
  SortedSetStructure, isSortedSet, fromArray, toArray,
  map, reduce, add, union, size
} from '@collectable/sorted-set';

export type Args<A> = {
  values: A | Array<A> | SortedSetStructure<A>,
  comparator?: (a: A, b: A) => number
}

function arrayify<V>(v: Array<V> | V): Array<V>{
  return Array.isArray(v) ? v : [v]
}

export default class SortedSet<A>  {

  readonly values: SortedSetStructure<A>
  readonly comparator?: (a: A, b: A) => number

  constructor({ values = [], comparator }: Args<A>)  {
    this.values = (isSortedSet(values)) ?
      values :
      fromArray(arrayify<A>(values), comparator || this.comparator)
  }

  concat(set: A | Array<A> | SortedSet<A>): SortedSet<A> {
    if (set instanceof SortedSet) {
      return this.of({ values: union(this.values, set.values) })
    }
    if (Array.isArray(set)) {
      return this.of({ values: union(this.values, fromArray(set)) })
    }
    return this.of({ values: add(set, this.values) })
  }

  map<B>(f: (a: A) => B): SortedSet<B> {
    return this.of({ values: map(f, this.values) })
  }

  static of<A>({ values, comparator }: Args<A> = { values: [] }): SortedSet<A>{
    return new SortedSet({ values, comparator })
  }

  get of() {
    return SortedSet.of
  }

  empty(): SortedSet<A> {
    return SortedSet.of<A>()
  }

  toJSON(){
    return toArray(this.values)
  }

  get size() {
    return size(this.values)
  }

  reduce<B>(f: (acc: B, v: A, index: number) => B, seed: B): B {
    return reduce(f, seed, this.values)
  }

}

