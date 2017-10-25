import { Map, Set, Record  } from 'immutable'
import * as random from '../random-utils'
import ConnectionGene from './connection-gene'

/* Ultimate structure: 
  Genome = Record({
    ...[facetName]: Map<innovation, Facet>
  })
 */

type ConnectionGenes = Map<number, ConnectionGene>

interface Genes {
  id: number
  fitness: number
  connections: ConnectionGenes
} 

const empty: Genes = {
  id: NaN,
  fitness: 0,
  connections: Map<number, ConnectionGene>()
}

class Genome extends Record<Genes>(empty) {

  private static incrementor = 0

  private static newId(){
    return Genome.incrementor++
  }

  constructor({ id = Genome.newId(), ...genome }: Partial<Genes>)  {
    super({ id, ...genome })
  }

  static of({ id = Genome.newId(), ...genome }: Partial<Genes>){
    return new Genome({ id, ...genome })
  }

  static empty(){
    return Genome.of(empty)
  }

  get size() {
    return this.connections.size
  }

  get connectionList() {
    return Array.from(this.connections.values())
  }

  map(f: (a: ConnectionGene, key: number) => ConnectionGene): Genome {
    return Genome.of({ connections: this.connections.map(f) })
  }

  reduce<B>(f: (acc: B, v: ConnectionGene, index: number) => B, seed: B): B {
    return this.connections.reduce(f, seed)
  }

}

export { Genome, ConnectionGenes }