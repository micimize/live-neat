import { prefix } from './io'
import {
  SortedSetStructure, isSortedSet, fromArray, toArray,
  map, reduce, add, union, size, some
} from '@collectable/sorted-set';
import { FantasyFunctor } from 'fp-ts/lib/Functor'

export const URI = `${prefix}SortedSet`
export type URI = typeof URI

export type Args<A> = {
  values: A | Array<A> | SortedSetStructure<A>,
  comparator?: (a: A, b: A) => number
}

function arrayify<V>(v: Array<V> | V): Array<V>{
  return Array.isArray(v) ? v : [v]
}

export default class SortedSet<A> implements FantasyFunctor<URI, A>  {

  readonly _A: A
  readonly _URI: URI = URI
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
    return { [this._URI]: toArray(this.values) }
  }

  get size() {
    return size(this.values)
  }

  reduce<B>(f: (acc: B, v: A, index: number) => B, seed: B): B {
    return reduce(f, seed, this.values)
  }

  some(f: (v: A) => boolean): boolean {
    return some(f, this.values)
  }

}

