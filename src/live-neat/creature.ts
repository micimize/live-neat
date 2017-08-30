import Genome, * as genome from './genome'

export function distance(a: Creature, b: Creature){
  return genome.distance(a.genome, b.genome)
}

export function crossover(a: Creature, b: Creature){
  return new Creature(genome.crossover(a.genome, b.genome))
}

const increment = (
  (ascending = 0) => () => ascending++
)()

export default class Creature {
  id: number;
  fitness: number;
  genome: Genome;
  constructor(genome: Genome) {
    this.genome = genome
    this.id = increment()
    this.fitness = 1
  }
  express(){
    // return network(this.genome)
  }
}


