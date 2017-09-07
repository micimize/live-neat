import Genome, * as genome from './genome'
import Network from './network/type'
import configurator from './configurator'

export function distance(a: Creature, b: Creature){
  return genome.distance(a.network.genome, b.network.genome)
}

const increment = (
  (ascending = 0) => () => ascending++
)()

export default class Creature {

  id: number;
  age: number;
  fitness: number;
  energy: number;
  network: Network;

  constructor(network: Network) {
    this.network = network
    this.id = increment()
    this.fitness = 1
    this.energy = 10
    this.age = 0
  }

  think(input){
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

}

