import { Map } from 'immutable'
import genePool from './gene-pooling'
import * as random from '../random-utils'
import { Genome, ConnectionGenes } from './genome'
import { ConnectionGene } from './connection-gene'
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

type Selecter = (k: number, [a, b]: Array<ConnectionGene>) => ConnectionGene 

function GeneSelecter(configuration: MutationConfiguration) {
  return <Selecter> function select(k: number, [a, b]) {
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

function randomlyExtractShared([ a, b ]: Array<ConnectionGenes>) {
  a = a.asMutable()
  let shared = Map<number, ConnectionGene>().asMutable()
  let seenInA = a.reduce((s, { from, to }, innovation) =>
    s.set({from, to}, innovation),
    Map<ConnectionGene.Potential, number>()
  )
  b = b.filter((conn, innovation) => {
    let { from , to } = conn
    if (seenInA.has({ from, to })){
      if(Math.random() > 0.50){
        let aIn = seenInA.get({ from, to }) || NaN // TODO THE HACKS
        shared.set(aIn, a.get(aIn) || conn)
      } else {
        shared.set(innovation, conn)
      }
      a.remove(seenInA.get({ from, to }) || NaN)
      return false
    }
    return true
  })
  return { a, b, shared }
}

const mix = {
  even([ _a, _b ]: Array<ConnectionGenes>, guaranteedUnique = false): ConnectionGenes {
    //if(!guaranteedUnique){
      let { shared, a, b } = randomlyExtractShared([_a,_b])
   // }
    let [ longer, shorter ] = a.size > b.size ?
      [ a, b ] :
      [ b, a ]
    let total = Math.ceil(
      Math.min(a.size, b.size) + Math.abs(a.size - b.size) / 2
    )
    return shared
      .merge(random.submap(longer, Math.ceil(total)))
      .merge(random.submap(shorter, Math.floor(total)))
  },
  left: ([ a, b ]) => a,
  right: ([ a, b ]) => b,
}

function ConnectionCrossover(configuration: MutationConfiguration, [ a, b ]){
  const selecter = GeneSelecter(configuration)
  let mixDisjointValues = /*a.fitness > b.fitness ? mix.left  :
                          a.fitness < b.fitness ? mix.right :
                        /*a.fitness = b.fitness*/ mix.even
  return MapCrossover<ConnectionGenes, number, ConnectionGene>({
    chooseIntersectionValue: selecter,
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