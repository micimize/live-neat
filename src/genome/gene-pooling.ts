import { Map, Set } from 'immutable'
import * as random from '../random-utils'

type Pool<Iter> = {
  intersection: Iter,
  disjoint: Array<Iter>
}

function pool<T>(sets: Array<Set<T>>): Pool<Set<T>> {
   let intersection = sets.reduce((a, b) => a.intersect(b))
   let disjoint = sets.map(set => set.subtract(intersection))
   return { intersection, disjoint }
}

function intersectingValues<K, V>(k: K, maps: Array<Map<K, V>>): Array<V> {
  return maps
    .map(m => m.get(k))
    .filter(v => v !== undefined) as Array<V>
}

function setToMap<K, V>(set: Set<[K, V]>): Map<K, V> {
  return Map<K, V>(set)
}

// TODO ideally map intersection would be decoupled
function mapPool<K, V>({ chooseIntersectionValue, maps }: {
  chooseIntersectionValue: (k: K, values: Array<V>) => V,
  maps: Array<Map<K, V>>
}): Pool<Map<K, V>> {
  let { intersection, disjoint } = pool<K>(maps.map(m => Set(m.keys())))
  let intersectionKeyValue = (k: K): [K, V] => [ k, chooseIntersectionValue(k, intersectingValues(k, maps)) ]
  return {
    intersection: setToMap<K, V>(intersection.map(intersectionKeyValue)),
    disjoint: disjoint.map((d, index) => maps[index].filter((value: V, key: K) => d.has(key)))
  }
}

export { pool }
export default mapPool