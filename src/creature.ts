import Genome, * as genome from './genome'
import Network from './network/type'

export function distance(a: Creature, b: Creature){
  return genome.distance(a.network.genome, b.network.genome)
}

const increment = (
  (ascending = 0) => () => ascending++
)()

export default class Creature {
  id: number;
  fitness: number;
  energy: number;
  network: Network;
  constructor(network: Network) {
    this.network = network
    this.id = increment()
    this.fitness = 1
  }
  think(input){
    return this.network.forward(input)
  }
  kill() {
  }
}
