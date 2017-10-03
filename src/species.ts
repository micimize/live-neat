import { Set } from 'immutable'
import configurator from './configurator'
import Creature, { distance } from './creature'
import { selection, weightedSelection } from './random-utils'
import Genome, { crossover } from './genome'

const increment = (
  (ascending = 0) => () => ascending++
)()

interface Hero {
  id: number,
  fitness: number,
  genome: Genome,
}

function asHero({ fitness, id, network: { genome } }: Creature): Hero {
  return { fitness, id, genome }
}

export default class Species {
  creatures: Set<Creature>;
  heroes: Array<Hero> = [];
  id: number;

  get fitness(): number {
    if (!this.creatures.size){
      let resurrectionModifier = configurator().reproduction.resurrectFromHeroesRate
      return this.heroes.length && resurrectionModifier ?
        resurrectionModifier * this.heroes.reduce(
          (total, creature) => total + creature.fitness, 0
        ) / this.heroes.length :
        0
    }
    return this.creatures.reduce(
      (total, creature) => total + creature.fitness,
      0
    ) / this.creatures.size
  }

  constructor(...creatures: Array<Creature>) {
    this.id = increment()
    this.creatures = Set.of(...creatures)
  }

  add(creature: Creature): boolean {
    let { compatibilityThreshold } = configurator().speciation
    if(this.creatures.some(member => distance(member, creature) < compatibilityThreshold)){
      this.creatures = this.creatures.add(creature)
      return true
    }
    return false
  }

  selectHero(): Hero {
    return weightedSelection(this.heroes, c => c.fitness ^ 2)
  }

  get genePool(): Set<Hero> {
    let livingPool = this.creatures.map(asHero)
    let { includeHeroGenesRate } = configurator().reproduction
    return this.creatures.map(asHero).union(this.heroes.map(
      ({ fitness, ...hero }) => ({ fitness: includeHeroGenesRate * fitness, ...hero })))
  }

  selectGenome({ not }: { not?: Genome } = {}): Genome | null {
    let pool = Array.from(this.genePool).filter(h => h.genome !== not)
    if (!pool.length){
      return null
    }
    // todo 0 fitness should probably be unselectable 
    return weightedSelection(
      Array.from(this.genePool).filter(h => h.genome !== not),
      h => h.fitness ^ 2
    ).genome
  }

  procreate(): Genome {
    let a = this.selectGenome()
    if(!a){ // TODO should be configurable
      return this.selectHero().genome // if there are no creatures, resurrect hero
      // this might not be as buggy as it seems - the first dead creature will always be in the hero list.
    }
    let b = this.selectGenome({ not: a })
    if(!b){
      // can only reproduce asexually
      return Object.assign({}, a)
    }
    return crossover(a, b)
  }

  chronicleHero(creature: Creature): boolean {
    // returns true if creature was a hero
    let heroCount = this.heroes.length

    if (heroCount < configurator().speciation.heroCount){
      this.heroes.push(asHero(creature))
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
    if (!this.creatures.has(creature)){
      throw Error('creature does not belong to this species')
    }
    this.creatures = this.creatures.delete(creature)
    return this.chronicleHero(creature)
  }

}


