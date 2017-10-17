import { Map, Set } from 'immutable'
import * as random from '../random-utils'
import { Crossover } from './functions'
import { connectionExpressionTracker, select as selectGene } from './connection-gene'

/*
  Ultimate structure: 
  Genome = Record({
    ...[facetName]: Map<innovation, Facet>
  })
 */

type ConnectionGenes = Map<number, ConnectionGene>

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

export const crossover = Crossover<ConnectionGenes, number, ConnectionGene>({
  chooseIntersectionValue: (k: number, connections: Array<ConnectionGene>) => selectGene(connections),
  mixDisjointValues: mix
})

export default class Genome {

  readonly _A: ConnectionGenes
  readonly connections: ConnectionGenes

  constructor({ connections }: { connections: ConnectionGenes })  {
    this.connections = connections
  }

  get size() {
    return this.connections.size
  }

  map(f: (a: ConnectionGene, key: number) => ConnectionGene): Genome {
    return new Genome({ connections: this.connections.map(f) })
  }

  reduce<B>(f: (acc: B, v: ConnectionGene, index: number) => B, seed: B): B {
    return this.connections.reduce(f, seed)
  }

}

