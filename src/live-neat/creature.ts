import Genome, * as genome from './genome'

export function distance(a: Creature, b: Creature){
  return genome.distance(a.genome, b.genome)
}

const increment = (
  (ascending = 0) => () => ascending++
)()

export default class Creature {
  id: number;
  fitness: number;
  network: Network;
  constructor(network: Network) {
    this.network = network
    this.id = increment()
    this.fitness = 1
  }
}


