import configurator from './configurator'
import Creature, { distance } from './creature'
import { selection, weightedChoice } from './random-utils'
import Genome, { crossover } from './genome'

const increment = (
  (ascending = 0) => () => ascending++
)()

interface Hero {
  id: number,
  fitness: number,
  genome: Genome,
}
export default class Species {
  creatures: Set<Creature>;
  heroes: Array<Hero> = [];
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
    return creature
  }

  procreate(): Genome {
    if(!this.creatures.size && this.heroes.length){ // TODO should be configurable
      return selection(this.heroes).genome          // if there are no creatures, resurrect hero
      // this might not be as buggy as it seems - the first dead creature will always be in the hero list.
      // TODO investigate why population even attempts to procreate dead species
    }
    let a = this.selectCreature()
    // can only reproduce asexually
    if(this.creatures.size == 1){
      if(this.heroes.length){ // TODO all the hero resurrection stuff is wonky
        return crossover(a.network.genome, selection(this.heroes).genome)
      }
      return Object.assign({}, a.network.genome)
    }
    let b = this.selectCreature({ not: a })
    return crossover(a.network.genome, b.network.genome)
  }

  chronicleHero(creature: Creature): boolean {
    // returns true if creature was a hero
    let heroCount = this.heroes.length

    if (heroCount < configurator().speciation.heroCount){
      let { fitness, id, network: { genome } } = creature
      this.heroes.push({ fitness, id, genome })
      this.heroes.sort((a, b) => b.fitness - a.fitness)
      return true
    } else if (
      this.heroes[heroCount - 1].fitness < creature.fitness || (
        this.heroes[heroCount - 1].fitness == creature.fitness && Math.random() < 0.5
      )
    ) {
      let { fitness, id, network: { genome } } = creature
      this.heroes[heroCount - 1] = { fitness, id, genome }
      this.heroes.sort((a, b) => b.fitness - a.fitness)
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


