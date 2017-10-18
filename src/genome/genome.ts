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
  fitness: NaN,
  connections: Map<number, ConnectionGene>()
}

class Genome extends Record(empty) implements Genes {

  private static incrementor = 0

  private static newId(){
    return Genome.incrementor++
  }

  constructor({ id = Genome.newId(), ...genome }: Genes)  {
    super({ id, ...genome })
  }

  static of(genome: Genes){
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
    let { id, fitness, connections } = this
    return new Genome({ id, fitness, connections: connections.map(f) })
  }

  reduce<B>(f: (acc: B, v: ConnectionGene, index: number) => B, seed: B): B {
    return this.connections.reduce(f, seed)
  }

}

export default Genome
export { ConnectionGenes }