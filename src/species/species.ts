import Structure, { S, comparator } from './structure'

import { Set, Record } from 'immutable'
import { Args as SSArgs } from '../structures/SortedSet'
import SortedSet, * as ss from '../structures/SortedSet'
import CompetitiveSet, * as cs from '../structures/CompetitiveSet'
import configurator from '../configurator'
import { Creature, distance } from '../creature'
import { selection, weightedSelection } from '../random-utils'
import { Genome, crossover } from '../genome'

// TODO refactor into struct/fp paradigm
class Species extends Structure {

  selectHero(): Genome {
    return weightedSelection(this.heroes.unwrap(), g => g.fitness ^ 2)
  }

  selectGenome({ not }: { not?: Genome } = {}): Genome | void {
    let pool = Array.from(this.genePool.filter(g => !g.equals(not)))
    if (!pool.length) {
      return
    }
    // todo 0 fitness should probably be unselectable 
    return weightedSelection(pool, h => h.fitness ^ 2)
  }

  procreate(): Genome {
    let a = this.selectGenome()
    if (!a) {
      /* TODO should be configurable
       * if there are no creatures, resurrect hero
       * this might not be as buggy as it seems -
       * the first dead creature will always be in the hero list.
       */
      return this.selectHero()
    }
    let b = this.selectGenome({ not: a })
    if (!b) {
      // can only reproduce asexually
      return a
    }
    return crossover([ a, b ])
  }

  add(creature: ss.Concatable<Creature>): Species {
    return this.set('creatures', this.creatures.concat(creature))
  }

  // TODO dredge up old imperetive add code for this
  compatible(creature: Creature): boolean {
    let { compatibilityThreshold } = configurator().speciation
    return this.creatures.some(member =>
      distance([ member, creature ]) < compatibilityThreshold)
  }

  addHero(genome: cs.Concatable<Genome>): Species {
    return this.set('heroes', this.heroes.concat(genome))
  }

  concat({ heroes, creatures }: Species): Species {
    return this
      .addHero(heroes)
      .add(creatures)
  }

  chronicleHero(creature: Creature): Species {
    // returns true if creature was a hero
    return this.addHero(creature.genome)
  }

  kill(creature: Creature): Species {
    if (!this.creatures.has(creature)) {
      throw Error('creature does not belong to this species')
    }
    return this
      .set('creatures', this.creatures.delete(creature))
      .chronicleHero(creature)
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

 export { Species, comparator }