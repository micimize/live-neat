import { Set } from 'immutable'
import { Record } from '../structures/Record'
import SortedSet, * as ss from '../structures/SortedSet'
import CompetitiveSet, * as cs from '../structures/CompetitiveSet'
import configurator from '../configurator'
import Creature from '../creature'
import Genome from '../genome'

export type Args = {
  heroLimit: number,
  creatures: Creature | Array<Creature>
}

function Comparator<A>(attr: string) {
  return (a: A, b: A) => Number(a[attr]) - Number(b[attr])
}

const comparator = Comparator<Creature>('fitness')

const empty = {
  id: NaN,
  age: 0,
  creatures: new SortedSet<Creature>({ comparator }),
  heroes: new CompetitiveSet<Genome>({ limit: 4, comparator: Comparator<Genome>('fitness') })
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

  static of({
    creature,
    creatures,
  }: Partial<S> & { creature?: Creature }): Species {
    if (!creatures) {
      creatures = creature ?
        new SortedSet<Creature>({ comparator, values: [creature] }) :
        empty.creatures
    }
    return new this({ creatures })
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

  get genePool(): Set<Genome> {
    let livingPool = this.creatures.unwrap().map(c => c.genome)
    let { includeHeroGenesRate } = configurator().reproduction
    let heroes = this.heroes.map(
      g => g.set('fitness', includeHeroGenesRate * g.fitness)
    ).unwrap()
    return Set<Genome>(livingPool.concat(heroes))
  }

}

export default Species
export { comparator }