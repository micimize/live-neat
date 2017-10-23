import { Set, Record } from 'immutable'

import { InnovationChronicle } from '../innovation'
import GeneExpresser from '../network/vanilla'
import { Species } from '../species'
import Creature from '../creature'
import configurator from '../configurator'

import { SortedSet, CompetitiveSet } from '../structures'

import Genome from '../genome'

// Creature should be dynamic, so the utilizing simulation can define it's own creature and have it managed
// * live-neat manages Population and evolution
// * utilizing simulation manages fitness and calls population.step as appropriate

function Comparator<A>(attr: string){
  return (a: A, b: A) => Number(a[attr]) - Number(b[attr])
}

const comparator = Comparator<Species>('fitness')

interface I {
  CreatureType: new (...rest: any[]) => Creature,
  chronicle: InnovationChronicle,
  expressor: object,
  resources: number,
  age: number,
}

const empty = {
  CreatureType: Creature,
  chronicle: InnovationChronicle.empty(),
  species: new CompetitiveSet<Species>({ limit: 0, comparator }),
  expressor: {},
  resources: 0,
  age: 0
}

class Population extends Record(empty) {

  constructor(population: I) {
    super(population)
  }

  get livingSpecies(): SortedSet<Species> {
    return this.species.filter(s => Boolean(s.size))
  }

  get size(): number {
    return this.species.reduce((s, { size }) => s + size, 0)
  }

  get creatures(): Set<Creature> {
    return this.species.reduce(
      (c, s) => c.concat(s.creatures.unwrap()),
      Set<Creature>()
    )
  }

  get heroes(): CompetitiveSet<Genome> {
    return this.species
      .reduce(
        (heroes, s) => heroes.concat(s.heroes),
        new CompetitiveSet<Genome>({ limit: 5, comparator: Comparator<Genome>('fitness') })
      )
  }

  add(creature: Creature): Population {
    let speciated = false
    for (let s of this.species){
      if(s.compatible(creature)){
        return this.set('species', this.species
          .delete(s)
          .concat(s.add(creature)))
      }
    }
    return this.set(
      'species',
      this.species.concat(
        Species.of({ creature })
      )
    )
  }

}

export { Population }