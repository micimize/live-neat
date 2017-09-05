import configurator from './configurator'
import Creature, { distance } from './creature'
import { weightedChoice } from '../random-utils'
import { crossover } from './genome'

const increment = (
  (ascending = 0) => () => ascending++
)()


export default class Species {
  creatures: Set<Creature>;
  heroes: Array<Creature> = [];
  id: number;

  get fitness(): number {
    let total = 0
    for (let creature of this.creatures){
      total += creature.fitness
    }
    return total / this.creatures.size
  }

  constructor(...creatures: Array<Creature>) {
    this.id = increment()
    this.creatures = new Set(creatures)
  }

  add(creature: Creature): boolean {
    let { compatibilityThreshold } = configurator().speciation
    for (let member of this.creatures){
      if (distance(member, creature) < compatibilityThreshold){
        this.creatures.add(creature)
        return true
      }
    }
    return false
  }

  selectCreature({ not }: { not?: Creature } = {}): Creature {
    let weights = {}
    let getter = {}
    for (let creature of this.creatures) {
      if (creature !== not){
        let { fitness, id } = creature
        weights[id] = fitness || 0
        getter[id] = creature
      }
    }
    let id = weightedChoice(weights)
    let creature = getter[id]
    if(!creature){
      (window as any).weightedChoice = weightedChoice
      console.log({ weights, getter, id })
      debugger;
    }
    return creature
  }

  procreate(): Creature {
    let a = this.selectCreature()
    let b = this.selectCreature({ not: a })
    return crossover(a.network.genome, b.network.genome)
  }

  chronicleHero(creature: Creature): boolean {
    // returns true if creature was a hero
    let heroCount = this.heroes.length

    if (heroCount < configurator().speciation.heroCount){
      this.heroes.push(creature)
      this.heroes.sort()
      return true
    } else if (
      this.heroes[heroCount - 1].fitness < creature.fitness || (
        this.heroes[heroCount - 1].fitness == creature.fitness && Math.random() < 0.5
      )
    ) {
      this.heroes[heroCount - 1] = creature
      this.heroes.sort()
      return true
    }
    return false 
  }

  kill(creature: Creature): boolean {
    if (!this.creatures.delete(creature)){
      throw Error('creature does not belong to this species')
    }
    return this.chronicleHero(creature)
  }

}


