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

  private static id(id: number | undefined): number {
    return (id === undefined || Number.isNaN(id) || id == Infinity) ?
      Genome.newId() :
      id
  }

  constructor({ id, ...genome }: Partial<Genes>)  {
    super({ id: Genome.id(id), ...genome })
  }

  static of(genome: Partial<Genes>){
    return new Genome(genome)
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