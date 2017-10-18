import {
  SortedSetStructure, isSortedSet, fromArray, toArray,
  map, reduce, add, union, size, filter,
  has, remove
} from '@collectable/sorted-set';

export type Args<A> = {
  values?: A | Array<A> | SortedSetStructure<A>,
  comparator: (a: A, b: A) => number
}

function arrayify<V>(v: Array<V> | V): Array<V>{
  return Array.isArray(v) ? v : [v]
}

export type Concatable<A> = A | Array<A> | SortedSet<A>

export default class SortedSet<A>  {

  readonly values: SortedSetStructure<A>
  readonly comparator: (a: A, b: A) => number

  constructor({ values = [], comparator }: Args<A>)  {
    this.values = (isSortedSet(values)) ?
      values :
      fromArray(arrayify<A>(values), comparator || this.comparator)
  }

  concat(set: Concatable<A>): SortedSet<A> {
    let values = (set instanceof SortedSet) ?
      union(this.values, set.values) :
      (Array.isArray(set)) ?
        union(this.values, fromArray(set)) :
        add(set, this.values)
    return this.of({ values })
  }

  map(f: (a: A) => A): SortedSet<A> {
    return this.of({ comparator: this.comparator, values: map(f, this.values) })
  }

  unwrap(): Array<A> {
    return toArray(this.values)
  }

  static of<A>({ values = [], comparator }: Args<A>): SortedSet<A>{
    return new SortedSet({ values, comparator })
  }

  of({ values = this.values, comparator = this.comparator }: Partial<Args<A>>): SortedSet<A> {
    return new SortedSet({ values, comparator })
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

  delete(a: A): SortedSet<A> {
    return this.of({ values: remove(a, this.values) })
  }
}

