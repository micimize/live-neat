import { prefix } from '../structures/io'
import { Map, Set } from 'immutable-ext'
import * as random from '../random-utils'
import { Crossover } from './functions'

import { connectionExpressionTracker, select as selectGene } from './connection-gene'

export const URI = `${prefix}Genome`
export type URI = typeof URI


type ConnectionGenes = Map<number, ConnectionGene>

class InnovationMap {

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

let crossover = Crossover({
  chooseIntersectionValue: (k: number, values: Array<ConnectionGene>) => selectGene(values),
  mixDisjointValues: mix
})

export default class Genome implements FantasyFunctor<URI, Genome>  {

  readonly _A: A
  readonly _URI: URI = URI
  readonly values: ConnectionGenes

  constructor(values: ConnectionGenes)  {
    this.values = values
  }

  concat(genes: ConnectionGenes): ConnectionGenes {
    return this.of(crossover([ this.values, genes ]))
  }

  map<B>(f: (a: A) => B): Genome {
    return this.of({ values: map(f, this.values) })
  }

  static of<A>(values: ConnectionGenes): Genome {
    return new Genome(values)
  }

  get of() {
    return Genome.of
  }

  empty(): Genome {
    return Genome.of(Map())
  }

  toJSON(){
    return { [this._URI]: this.values.toJSON() }
  }

  get size() {
    return this.values.size
  }

  reduce<B>(f: (acc: B, v: ConnectionGene, index: number) => B, seed: B): B {
    return this.values.reduce(f, seed)
  }

}

