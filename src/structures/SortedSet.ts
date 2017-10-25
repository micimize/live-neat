import {
  SortedSetStructure, isSortedSet, fromArray, toArray,
  map, reduce, add, union, size, filter,
  has, remove, first
} from '@collectable/sorted-set';
import * as s from '@collectable/sorted-set';

export type Args<A> = {
  values?: A | Array<A> | SortedSetStructure<A>,
  comparator: (a: A, b: A) => number
}

function arrayify<V>(v: Array<V> | V): Array<V>{
  return Array.isArray(v) ? v : [v]
}

export type Concatable<A> = A | Array<A> | SortedSet<A>

export default class SortedSet<A> {

  readonly values: SortedSetStructure<A>
  readonly comparator: (a: A, b: A) => number

  'constructor': typeof SortedSet
  constructor({ values = [], comparator }: Args<A>) {
    this.values = (isSortedSet(values)) ?
      values :
      fromArray(arrayify<A>(values), comparator || this.comparator)
  }

  static of<A>({ values = [], comparator }: Args<A>) {
    return new this({ values, comparator })
  }

  of({ values = this.values, comparator = this.comparator }: Partial<Args<A>>) {
    return this.constructor.of({ values, comparator })
  }

  [Symbol.iterator](){
    return this.values[Symbol.iterator]()
  }

  concat(set: Concatable<A>): SortedSet<A> {
    let values = (set instanceof SortedSet) ?
      union(set.values, this.values) :
      union(this.values, fromArray<A>(arrayify(set)))
    return this.of({ values })
  }

  map(f: (a: A) => A) {
    return this.of({ values: map(f, this.values) })
  }

  unwrap(): Array<A> {
    return toArray(this.values)
  }

  get toJSON(){
    return this.unwrap()
  }

  get size(): number {
    return size(this.values)
  }

  reduce<B>(f: (acc: B, v: A, index: number) => B, seed: B): B {
    return reduce(f, seed, this.values)
  }

  filter(f: (v: A, index: number) => boolean): SortedSet<A> {
    return this.of({ values: filter(f, this.values) })
  }

  has(a: A): boolean {
    return has(a, this.values)
  }

  first(): A | undefined {
    return first(this.values)
  }

  some(f: (a: A) => boolean): boolean {
    for (let a of this.values){
      if(f(a)){
        return true
      }
    }
    return false
  }

  delete(a: A): SortedSet<A> {
    return this.of({ values: remove(a, this.values) })
  }
}

