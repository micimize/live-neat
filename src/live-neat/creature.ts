import Genome, * as genome from './genome'

export function distance(a: Creature, b: Creature){
  return genome.distance(a.genome, b.genome)
}

export function crossover(a: Creature, b: Creature){
  return new Creature(genome.crossover(a.genome, b.genome))
}

export default class Creature {
  id?: number;
  fitness?: number;
  genome: Genome;
  constructor(genome: Genome) {
    this.genome = genome
  }
  express(){
    // return network(this.genome)
  }
}


