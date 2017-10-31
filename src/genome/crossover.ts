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

const mix = {
  even([ a, b ]: Array<ConnectionGenes>): ConnectionGenes {
    let [ longer, shorter ] = a.size > b.size ?
      [ a, b ] :
      [ b, a ]
    let total = Math.ceil(
      Math.min(a.size, b.size) + Math.abs(a.size - b.size) / 2
    )
    return random.submap(longer, Math.ceil(total)).merge(
      random.submap(shorter, Math.floor(total)))
  },
  left: ([ a, b ]) => a,
  right: ([ a, b ]) => b,
}

function ConnectionCrossover(configuration: MutationConfiguration, [ a, b ]){
  let mixDisjointValues = a.fitness > b.fitness ? mix.left  :
                          a.fitness < b.fitness ? mix.right :
                        /*a.fitness = b.fitness*/ mix.even
  return MapCrossover<ConnectionGenes, number, ConnectionGene>({
    chooseIntersectionValue: GeneSelecter(configuration),
    mixDisjointValues
  })
}

function GenomeCrossover(configuration: MutationConfiguration = MutationConfiguration()){
  // TODO a bit janky because of migration to fitness mattering in crossover
  // refactor when implementing configuration injection via reader monad
  return ([ a, b ]: Array<Genome>): Genome => {
    let connectionCrossover = ConnectionCrossover(configuration, [ a, b ])
    return Genome.of({
      connections: connectionCrossover([ a.connections, b.connections ])
    })
  }
}

export default GenomeCrossover