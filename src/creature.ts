import { Record  } from 'immutable'
import * as genome from './genome'
import configurator from './configurator'

export function distance([ a, b ]: Array<Creature>): number {
  return genome.distance([ a.network.genome, b.network.genome ])
}

const empty = {
  age: 0,
  energy: 0,
  genome: genome.Genome.empty(),
  //network: Network()
}

class Creature extends Record(empty) {

  get id(){
    return this.genome.id
  }

  get fitness(){
    return this.genome.fitness
  }

  set fitness(fit: number){
    this.setIn(['genome', 'fitness'], fit)
  }

  age: number;
  energy: number;
  network: Network;

  constructor(creature: { genome: genome.Genome, network: Network }) {
    super(creature)
  }

  think(input){
    this.network.clear()
    return this.network.forward(input)
  }

  step(info: any): Creature {
    let { energy = 0 } = info
    return this.withMutations(creature => {
      // default fitness is average energy
      // increments age
      creature.setIn([ 'genome', 'fitness' ], (creature.fitness * creature.age + energy ) / creature.age + 1)
      creature.set('age', creature.age + 1)

      // default cost is the age * ageSignificance
      let cost = Math.floor(creature.age * configurator().population.ageSignificance)

      creature.set('energy', Math.max(creature.energy + energy - cost, 0))
    })
  }

  kill() {
  }

}

export { Creature }