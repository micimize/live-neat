import { Record } from 'immutable'
import SortedSet, * as ss from '../structures/SortedSet'
import CompetitiveSet, * as cs from '../structures/CompetitiveSet'
import { Creature } from '../creature'
import { Genome } from '../genome'

export type Args = {
  heroLimit: number,
  creatures: Creature | Array<Creature>
}

const comparator = ss.Sort.Descending<Creature>('fitness')

const empty = {
  id: NaN,
  age: 0,
  creatures: new SortedSet<Creature>({ comparator }),
  heroes: new CompetitiveSet<Genome>({ limit: 4, comparator: ss.Sort.Descending<Genome>('fitness') })
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

  get fitness(): number {
    return this.creatures.reduce(
      (total, creature) => total + creature.fitness,
      0
    ) / this.size
  }

  // exposed functionality
  add(creature: ss.Concatable<Creature>): Species {
    return this.set('creatures', this.creatures.concat(creature))
  }

  addHero(genome: cs.Concatable<Genome>): Species {
    return this.set('heroes', this.heroes.concat(genome))
  }

  concat({ heroes, creatures }: Species): Species {
    return this
      .addHero(heroes)
      .add(creatures)
  }

  kill(creature: Creature): Species {
    if (!this.creatures.has(creature)) {
      throw Error('creature does not belong to this species')
    }
    return this
      .set('creatures', this.creatures.delete(creature))
      .addHero(creature.genome)
  }

  static of({
    id,
    creature,
    creatures = SortedSet.of<Creature>({ comparator, values: creature ? [ creature ] : [] }),
    ...species
  }: Partial<S> & { creature?: Creature }): Species {
    return new Species({ creatures, ...species })
  }

  map(f: (creature: Creature) => Creature): Species {
    return this.set('creatures', this.creatures.map(f))
  }

}

export { Species }