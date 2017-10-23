import { Record  } from 'immutable'
import Genome, * as genome from './genome'
import configurator from './configurator'

export function distance([ a, b ]: Array<Creature>): number {
  return genome.distance([ a.network.genome, b.network.genome ])
}

const empty = {
  age: 0,
  energy: 0,
  genome: Genome.empty(),
  //network: Network()
}

class Creature extends Record(empty) {

  get id(){
    return this.genome.id
  }

  get fitness(){
    return this.genome.fitness
  }

  age: number;
  energy: number;
  network: Network;

  constructor(creature: { genome: Genome, network: Network }) {
    super(creature)
  }

  think(input){
    this.network.clear()
    return this.network.forward(input)
  }

  process({ energy }: { energy: number }): Creature {
    return this.withMutations(creature => {
      // default fitness is average energy
      // increments age
      creature.setIn([ 'genome', 'fitness' ], (creature.fitness * creature.age + energy ) / creature.age + 1)
      creature.set('age', creature.age + 1)

      // default cost is the age * ageSignificance
      let cost = Math.floor(creature.age * configurator().population.ageSignificance)

      creature.set('energy', Math.max(creature.energy + energy - cost, 0))
      return creature
    })
  }

  kill() {
  }

}

export default Creature