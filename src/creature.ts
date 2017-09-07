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
    this.age += 1
    let cost: number = (
      /* 10 additional or 100 connections require one more energy */ 
      // Math.floor(this.network.complexity / 10) + TODO reimplement
      /*  every 5 years requires 1 more energy to get through */ 
      Math.floor(this.age * configurator().population.ageSignificance)
    )
    if(energy > 0){
      this.fitness += energy
    }
    this.energy = Math.max(this.energy + energy - cost, 0)
  }

  kill() {
  }

}

