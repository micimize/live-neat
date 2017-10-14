import { prefix } from './io'
import { Map as IMap, Set as ISet } from 'immutable'
import { FantasyTraversable } from 'fp-ts/lib/Traversable'

export const URI = `${prefix}Map`
export type URI = typeof URI


export function intersectKeys<K, V>(
  first: IMap<K, V> = IMap.empty,
  ...maps: Array<IMap<K, V>>
): ISet<K> {
  return maps.reduce((intersection, map) =>
    intersection.intersect(new ISet(map.keys())))
}



export default class FMap<K, V> implements FantasyTraversable<URI, FMap<K, V>> {

  readonly _A: FMap<K, V>
  readonly _URI: URI = URI

  readonly value: IMap<K, V>

  constructor(value = IMap<K, V>())  {
    this.value = (IMap.isMap(value)) ?
      value :
      IMap.of()
      fromArray(arrayify<A>(values), comparator || this.comparator)
  }

  concat(genes: ConnectionGenes): ConnectionGenes {
    return this.of(crossover([ this.values, genes ]))
  }

  map<B>(f: (a: A) => B): Genome {
    return this.of({ values: map(f, this.values) })
  }

  static of<K, V>(value = IMap<K, V>()): FMap<K, V> {
    return new FMap(value)
  }
  readonly of = FMap.of

  toJSON(){
    return { [this._URI]: this.value.toJSON() }
  }

  get size() {
    return this.value.size
  }

  toJSON(){
    return { [this._URI]: this.toJSON() }
  }

  // semigroup
  concat(other: FMap<K, V> | IMap<K, V> | Array<[K, V]> ) {
    return this.value.mergeWith((prev, next) => prev.concat(next), this.of(other))
  }

  // monoid
  static empty(){
    return FMap.of()
  }
  readonly empty = FMap.empty

  // foldable
  reduce<B>(f: (reduction: B, value: V, key: K, iter: IMap<K, V>) => B, seed: B): B {
    return this.value.reduce(f, seed)
  }

  // traversable
  traverse(point, f) {
    return this.value.reduce((acc, v, k) =>
      f(v, k).map(x => y => y.merge({[k]: x})).ap(acc), point(this.empty))
  }

  sequence(point){
    return this.traverse(point, x => x)
  }

  // monad
  chain = IMap.prototype.flatMap

}
