import { Map } from 'immutable'
import genePool from './gene-pooling'
import * as random from '../random-utils'
import Genome, { ConnectionGenes } from './genome'
import ConnectionGene from './connection-gene'
import configurator from '../configurator'

type Args<K, V> = {
  chooseIntersectionValue: (k: K, values: Array<V>) => V,
  mixDisjointValues: (sources: Array<Map<K, V>>) => Map<K, V>,
}

function Crossover<T extends Map<K, V>, K, V>({
  chooseIntersectionValue,
  mixDisjointValues,
}: Args<K, V>) {
  return (sources: Array<Map<K, V>>) => {
    let { intersection, disjoint } = genePool<K, V>({ chooseIntersectionValue, maps: sources })
    return mixDisjointValues(disjoint).merge(intersection)
  }
}


function selectGene([ a, b ]: Array<ConnectionGene>){
  if (!a.active){
    if (!b.active){
      // weight tossup if neither active
      return Math.random() > 0.50 ? a : b
    } else {
      // weight tossup if neither active
      return Math.random() > configurator().mutation.reenable ? a : b
    }
  } else { // if (a.active) {
    if (!b.active){
      return Math.random() > configurator().mutation.reenable ? b : a
    } else {
      return Math.random() > 0.50 ? a : b
    }
  }
}

function mix([ a, b ]: Array<ConnectionGenes>): ConnectionGenes {
  let [ longer, shorter ] = a.size > b.size ?
    [ a, b ] :
    [ b, a ]
  let total = Math.ceil(
    Math.min(a.size, b.size) + Math.abs(a.size - b.size) / 2
  )
  return random.submap(longer, Math.ceil(total)).merge(
    random.submap(shorter, Math.floor(total)))
}

const connectionCrossover = Crossover<ConnectionGenes, number, ConnectionGene>({
  chooseIntersectionValue: (k: number, connections: Array<ConnectionGene>) => selectGene(connections),
  mixDisjointValues: mix
})

function crossover([ a, b ]: Array<Genome>): Genome {
  return Genome.of({
    connections: connectionCrossover([ a.connections, b.connections ])
  })
}

export default crossover