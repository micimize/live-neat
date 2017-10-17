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
  connections: ConnectionGenes
} 

const empty = { connections: Map<number, ConnectionGene>() }

class Genome extends Record(empty) implements Genes {

  readonly connections: ConnectionGenes

  constructor(genome: Genes = empty)  {
    super(genome)
  }

  static of(genome: Genes = empty){
    return new Genome(genome)
  }

  static empty(){
    return Genome.of()
  }

  get size() {
    return this.connections.size
  }

  get connectionList() {
    return Array.from(this.connections.values())
  }

  map(f: (a: ConnectionGene, key: number) => ConnectionGene): Genome {
    return new Genome({ connections: this.connections.map(f) })
  }

  reduce<B>(f: (acc: B, v: ConnectionGene, index: number) => B, seed: B): B {
    return this.connections.reduce(f, seed)
  }

}

export default Genome
export { ConnectionGenes }