import { Set, Record } from 'immutable'

import { InnovationChronicle, fromConfiguration } from '../innovation'
import * as chronicle from '../innovation'
import { GeneExpresser, Express } from '../network/vanilla'
import { Species } from '../species'
import { Creature } from '../creature'
import Configuration from './configuration'

import { SortedSet, CompetitiveSet } from '../structures'

import { Genome } from '../genome'

// Creature should be dynamic, so the utilizing simulation can define it's own creature and have it managed
// * live-neat manages Population and evolution
// * utilizing simulation manages fitness and calls population.step as appropriate

function Comparator<A>(attr: string){
  return (a: A, b: A) => Number(a[attr]) - Number(b[attr]) }

const comparator = Comparator<Species>('fitness')

interface I {
  Creature: new (...rest: any[]) => Creature,
  configuration: Partial<Configuration>,
  chronicle: InnovationChronicle,
  express: Express,
  resources: number,
  age: number,
}

const empty = {
  Creature: Creature,
  configuration: Configuration(),
  chronicle: InnovationChronicle.empty(),
  species: CompetitiveSet.of<Species>({ limit: 0, comparator }),
  express: GeneExpresser({ chronicle: InnovationChronicle.empty() }),
  resources: 0,
  age: 0
}

class Population extends Record(empty) implements I {

  constructor({ chronicle, configuration: partial, ...population }: Partial<I>) {
    let configuration = Configuration(partial)
    chronicle = chronicle || fromConfiguration(configuration.innovation)
    super({
      chronicle,
      configuration,
      ...population
    })
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

  static of(population: Partial<I>): Population {
    return new Population(population)
  }

  map(f: (creature: Creature) => Creature): Population {
    return this.set('species', this.species.map(species => species.map(f)))
  }

}

export { Population }
