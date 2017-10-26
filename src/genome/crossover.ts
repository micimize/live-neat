import { Map } from 'immutable'
import genePool from './gene-pooling'
import * as random from '../random-utils'
import { Genome, ConnectionGenes } from './genome'
import ConnectionGene from './connection-gene'
import MutationConfiguration from '../mutation/configuration'
import { curry } from 'fp-ts/lib/function'

type Args<K, V> = {
  chooseIntersectionValue: (k: K, values: Array<V>) => V,
  mixDisjointValues: (sources: Array<Map<K, V>>) => Map<K, V>,
}

function MapCrossover<T extends Map<K, V>, K, V>({
  chooseIntersectionValue,
  mixDisjointValues,
}: Args<K, V>) {
  return (sources: Array<Map<K, V>>) => {
    let { intersection, disjoint } = genePool<K, V>({ chooseIntersectionValue, maps: sources })
    return mixDisjointValues(disjoint).merge(intersection)
  }
}

function GeneSelecter(configuration: MutationConfiguration) {
  return function select(k: number, [a, b]: Array<ConnectionGene>){
    if (!a.active) {
      if (!b.active) {
        // weight tossup if neither active
        return Math.random() > 0.50 ? a : b
      } else {
        // weight tossup if neither active
        return Math.random() > configuration.connection.reenable ? a : b
      }
    } else { // if (a.active) {
      if (!b.active) {
        return Math.random() > configuration.connection.reenable ? b : a
      } else {
        return Math.random() > 0.50 ? a : b
      }
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

function ConnectionCrossover(configuration: MutationConfiguration){
  return MapCrossover<ConnectionGenes, number, ConnectionGene>({
    chooseIntersectionValue: GeneSelecter(configuration),
    mixDisjointValues: mix
  })
}

function GenomeCrossover(configuration: MutationConfiguration = MutationConfiguration()){
  let connectionCrossover = ConnectionCrossover(configuration)
  return ([ a, b ]: Array<Genome>) => Genome.of({
    connections: connectionCrossover([ a.connections, b.connections ])
  })
}

export default GenomeCrossover