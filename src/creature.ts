import * as genome from './genome'
import configurator from './configurator'

export function distance(a: Creature, b: Creature){
  return genome.distance(a.network.genome, b.network.genome)
}

const increment = (
  (ascending = 0) => () => ascending++
)()

type CreatureSeed {
  id: number
  fitness
  genome: Genome
}

export default class Creature {

  signature: Signature;
  id: number;
  age: number;
  fitness: number;
  energy: number;
  network: Network;

  constructor(network: Network) {
    this.network = network
    this.id = increment()
    this.age = 0
    this.fitness = 0
    this.energy = 10
  }

  think(input){
    this.network.clear()
    return this.network.forward(input)
  }

  process(energy: number): void {
    // default fitness is average energy
    // increments age
    this.fitness = ( this.fitness * this.age + energy ) / ++this.age

    // default cost is the age * ageSignificance
    let cost = Math.floor(this.age * configurator().population.ageSignificance)

    this.energy = Math.max(this.energy + energy - cost, 0)
  }

  kill() {
  }

  toJSON(){

  }

}

