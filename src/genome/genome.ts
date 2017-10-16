import { prefix } from '../structures/io'
import { Map, Set } from 'immutable-ext'
import * as random from '../random-utils'
import { Crossover } from './functions'
import { FantasyFunctor } from 'fp-ts/lib/Functor'
import { connectionExpressionTracker, select as selectGene } from './connection-gene'

export const URI = `${prefix}Genome`
export type URI = typeof URI


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

export default class Genome implements FantasyFunctor<URI, ConnectionGenes>  {

  readonly _A: ConnectionGenes
  readonly _URI: URI = URI
  readonly connections: ConnectionGenes

  constructor(connections: ConnectionGenes)  {
    this.connections = connections
  }

  // fantasy land

  concat({ connections }: { connections: ConnectionGenes }): Genome {
    return this.of(crossover([ this.connections, connections ]))
  }

  map<B>(f: (a: ConnectionGene, key: number) => B): Genome {
    return this.of({ connections: this.connections.map(f) })
  }

  static of({ connections = Map() }: { connections: ConnectionGenes } = {}): Genome {
    return new Genome({ connections })
  }

  readonly of = Genome.of
  static empty = Genome.of
  readonly empty = Genome.of

  toJSON(){
    return { [this._URI]: this.connections.toJSON() }
  }

  get size() {
    return this.connections.size
  }

  reduce<B>(f: (acc: B, v: ConnectionGene, index: number) => B, seed: B): B {
    return this.connections.reduce(f, seed)
  }

}

