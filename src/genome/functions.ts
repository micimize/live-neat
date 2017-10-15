import { Map, Set } from 'immutable-ext'
import * as random from '../random-utils'

type Pool<Iter> = {
  intersection: Iter,
  disjoint: Array<Iter>
}

/* generics */

function pool<T>(sets: Array<Set<T>>): Pool<Set<T>> {
   let intersection = sets.reduce(Set.intersect)
   let disjoint = sets.map(set => set.subtract(intersection))
   return { intersection, disjoint }
}

function intersectingValues<K, V>(k: K, maps: Array<Map<K, V>>): Array<V> {
  return maps
    .map(m => m.get(k))
    .filter(v => v !== undefined) as Array<V>
}

function setToMap<K, V>(set: Set<[K, V]>): Map<K, V> {
  return new Map(set)
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

type Args<K, V> = {
  chooseIntersectionValue: (k: K, values: Array<V>) => V,
  mixDisjointValues: (sources: Array<Map<K, V>>) => Map<K, V>,
}

export function Crossover<T extends Map<K, V>, K, V>({
  chooseIntersectionValue,
  mixDisjointValues,
}: Args<K, V>) {
  return (sources: Array<Map<K, V>>) => {
    let { intersection, disjoint } = mapPool<K, V>({ chooseIntersectionValue, maps: sources })
    return mixDisjointValues(disjoint).merge(intersection)
  }
}
