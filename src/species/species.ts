import { Record } from 'immutable'
import { Args as SSArgs } from '../structures/SortedSet'
import { SortedSet, CompetitiveSet } from '../structures'
import configurator from '../configurator'
import Creature, { distance } from '../creature'
import { selection, weightedSelection } from '../random-utils'
import { crossover } from '../genome'

export type Args = {
  heroLimit: number,
  creatures: Creature | Array<Creature>
}

function Comparator<A>(attr: string){
  return (a: A, b: A) => Number(a[attr]) - Number(b[attr])
}

export default class Species extends SortedSet<Creature> {
  readonly heroes: CompetitiveSet<Hero>;
  readonly id: number;
  readonly age: number = 0;

  get fitness(): number {
    return this.reduce(
      (total, creature) => total + creature.fitness,
      0
    ) / this.size
  }

  constructor({ heroLimit, creatures }: Args)  {
    super({ comparator: Comparator<Creature>('fitness'), values: creatures })
    this.heroes = CompetitiveSet.of({ limit: heroLimit, values: [], comparator: Comparator<Hero>('fitness') })
  }

  add(creature: Creature): boolean {
    let { compatibilityThreshold } = configurator().speciation
    if(this.some(member => distance(member, creature) < compatibilityThreshold)){
      this.creatures = this.creatures.add(creature)
      return true
    }
    return false
  }

  concat(value: Creature | Hero | Species): Species {
    if(value instanceof Creature){

    }
    return this.of({ limit: this.limit, values: super.concat(set).values })
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
      Array.from(this.genePool).filter(h => h.genome !== not), h => h.fitness ^ 2
    ).genome
  }

  static of<A>({ heroLimit, creatures = [] }): Species {
    return new Species({ limit, values, ...args }).culled()
  }

  get of() {
    return CompetitiveSet.of
  }

}

export class Sepcies extends Record({ value: 0, creatures: (SortedSet<Creature>).of() }) {
    value: number;
    status: Status;

    constructor(params?: CounterParams) {
        params ? super(params) : super();
    }

    with(values: CounterParams) {
        return this.merge(values) as this;
    }
}

interface Species {
  heroes: Array<Hero> = [];
  creatures: SortedSet<Creature>;
  id: number;
  age: number;
}


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
  creatures: SortedSet<Creature>;
  heroes: Array<Hero> = [];
  id: number;
  age: number = 0;

  get size(): number {
    return this.creatures.size
  }

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
    this.creatures = CompetitiveSet(creatures)
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
      return this.selectHero().genome // if there are no creatures, resurrect hero // this might not be as buggy as it seems - the first dead creature will always be in the hero list.
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



function procreate(species: Species): Genome {
    let a = species.selectGenome()
    if(!a){ // TODO should be configurable
      return species.selectHero().genome // if there are no creatures, resurrect hero // this might not be as buggy as it seems - the first dead creature will always be in the hero list.
    }
    let b = species.selectGenome({ not: a })
    if(!b){
      // can only reproduce asexually
      return Object.assign({}, a)
    }
    return crossover(a, b)
  }
}