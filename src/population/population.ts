import { Set, Record } from 'immutable'
import { SortedSet, CompetitiveSet } from '../structures'
import { thread } from '../utils'

import Configuration from './configuration'

import { InnovationChronicle, fromConfiguration } from '../innovation'
import * as chronicle from '../innovation'

import { GeneExpresser, Express } from '../network/vanilla'
import { Genome } from '../genome'
import { Creature } from '../creature'
import { Species, speciater } from '../species'
import { seed } from '../mutation'

// Creature should be dynamic, so the utilizing simulation can define it's own creature and have it managed
// * live-neat manages Population and evolution
// * utilizing simulation manages fitness and calls population.step as appropriate

function Comparator<A>(attr: string){
  return (a: A, b: A) => Number(a[attr]) - Number(b[attr]) }

const comparator = Comparator<Species>('fitness')

interface I {
  Creature: new (...rest: any[]) => Creature,
  configuration: Configuration,
  chronicle: InnovationChronicle,
  express: Express,
  speciate: (species: SortedSet<Species>, creature: Creature) => SortedSet<Species>,
  species: SortedSet<Species>,
  resources: number,
  age: number,
}
// TODO copy pasted
type PI = Partial<{
  Creature: new (...rest: any[]) => Creature,
  configuration: Partial<Configuration>,
  chronicle: InnovationChronicle,
  speciate: (species: SortedSet<Species>, creature: Creature) => SortedSet<Species>,
  express: Express,
  species: SortedSet<Species>,
  resources: number,
  age: number,
}>

let emptySpecies = SortedSet.of<Species>({ comparator })

const empty = {
  Creature: Creature,
  configuration: Configuration(),
  chronicle: InnovationChronicle.empty(),
  species: emptySpecies,
  speciate: (species: SortedSet<Species>, creature: Creature) => species,
  express: GeneExpresser({ chronicle: InnovationChronicle.empty() }),
  resources: 0,
  age: 0
}

class Population extends Record<I>(empty) {

  // TODO this thing is a mess
  // basically dumping complexity here to refactor the rest of the code base
  constructor({
    chronicle: c,
    configuration: partial,
    express: _,
    Creature: C = empty.Creature,
    speciate = empty.speciate,
    species = undefined,
    ...population
  }: Partial<PI>) {
    let configuration = Configuration(partial)
    let chronicle = c || fromConfiguration(configuration.innovation)
    let express = GeneExpresser({ chronicle })
    speciate = speciater(configuration.speciation)
    if(!species){
      let { chronicle: _c, genomes } = seed({
        chronicle,
        size: configuration.population.initialSize
      })
      chronicle = _c
      let creatures = genomes.map(genome => new C({
        genome,
        network: express({ genome, chronicle })
      }))
      species = creatures.reduce(speciate, emptySpecies)
    }
    super({
      express,
      chronicle,
      species,
      speciate,
      Creature: C,
      ...population,
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
    return this.set('species',
      this.speciate(this.species, creature))
  }

  static of(population: PI): Population {
    return new Population(population)
  }

  map(f: (creature: Creature) => Creature): Population {
    return this.set('species', this.species.map(species => species.map(f)))
  }

}

export { Population }
