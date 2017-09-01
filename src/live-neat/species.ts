import configurator from './configurator'
import Creature, { distance } from './creature'
import { weightedChoice } from '../random-utils'
import { crossover } from './genome'


export default class Species {
  creatures: Set<Creature>;
  id: number;

  get fitness(): number {
    let total = 0
    for (let creature of this.creatures){
      total += creature.fitness
    }
    return total / this.creatures.size
  }

  constructor(...creatures: Array<Creature>) {
    this.creatures = new Set(creatures)
  }

  add(creature: Creature): boolean {
    let { compatibilityThreshold } = configurator().speciation
    for (let member of this.creatures){
      if (distance(member, creature) < compatibilityThreshold){
        this.creatures.add(creature)
      }
      return true
    }
    return false
  }

  selectCreature({ not }: { not?: Creature } = {}){
    let weights = {}
    let getter = {}
    for (let creature of this.creatures) {
      if (creature !== not){
        let { fitness, id } = creature
        weights[id] = fitness
        getter[id] = creature
      }
    }
    return getter[weightedChoice(weights)]
  }

  procreate(): Creature {
    let a = this.selectCreature()
    let b = this.selectCreature({ not: a })
    return crossover(a.network.genome, b.network.genome)
  }
}


