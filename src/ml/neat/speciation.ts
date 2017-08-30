import configurator from './configurator'
import Creature, { crossover, distance } from './creature'
import { weightedChoice } from './random-utils'


class Species {
  creatures: Set<Creature>;
  id: number;
  get fitness(): number {
    let total = 0
    for (let { fitness } of this.creatures){
      total += fitness
    }
    return total / this.creatures.size
  }
  constructor(creature: Creature) {
    this.creatures = new Set(creature)
  }
  add(creature: Creature): boolean {
    let { compatibilityThreshold } = configurator().speciation
    for (let member of this.creatures){
      if (distance(speciesMember, creature) < compatibilityThreshold){
        this.creatures.add(creature)
      }
      return true
    }
    return false
  }

  selectCreature({ not } = {}: { not?: Creature }){
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
  }

  procreate(){
    let a = this.selectCreature()
    let b = this.selectCreature({ not: a })
    return new Creature(crossover(a, b))
  }

}


