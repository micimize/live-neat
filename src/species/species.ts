import { Record, List, Set } from 'immutable'
import { LeaderSelecter } from '../utils'
import { Creature } from '../creature'
import { Genome } from '../genome'

export type Args = {
  heroLimit: number,
  creatures: Creature | Array<Creature>
}

const empty = {
  id: NaN,
  age: 0,
  stagnation: {
    best: 0,
    age: 0,
  },
  creatures: Set<Creature>(),
  heroes: List<Genome>()
}

type S = typeof empty

class Species extends Record(empty) {

  private static incrementor = 0

  private static newId() {
    return Species.incrementor++
  }

  constructor({ id = Species.newId(), ...species }: Partial<S>) {
    super({ id, ...species })
  }

  get size(): number {
    return this.creatures.size
  }

  private get averageCreatureFitness(): number {
    return !this.size ? 0 :
      (this.creatures.reduce((total, creature) =>
        total + creature.fitness, 0) / this.size)
  }

  get fitness(): number {
    return this.averageCreatureFitness /
    (this.stagnation.age > 20 ? 10 : 1)
  }

  // exposed functionality
  add(creature: Creature): Species {
    return this.set('creatures', this.creatures.add(creature))
  }

  addHero(genome: Genome, selecter: (leaders: List<Genome>, g: Genome) => List<Genome>): Species {
    return this.set('heroes', selecter(this.heroes, genome))
  }

  kill(creature: Creature, selecter): Species {
    if (!this.creatures.has(creature)) {
      throw Error('creature does not belong to this species')
    }
    return this
      .set('creatures', this.creatures.delete(creature))
      .addHero(creature.genome, selecter)
  }

  static of({
    id,
    creature,
    creatures = Set<Creature>(creature ? [ creature ] : []),
    ...species
  }: Partial<S> & { creature?: Creature }): Species {
    return new Species({ creatures, ...species })
  }

  map(f: (creature: Creature) => Creature): Species {
    return this.set('creatures', this.creatures.map(f))
  }

  some(predicate: (creature: Creature) => boolean): boolean {
    for (let creature of this.creatures){
      if(predicate(creature)){
        return true
      }
    }
    return false
  }

}

export { Species }