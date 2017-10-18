import { Record } from 'immutable'
import InnovationContext from '../innovation-context'
import GeneExpresser from '../network/vanilla'
import Species from '../species/species'
import Creature from '../creature'

import { CompetitiveSet } from '../structures'


// Creature should be dynamic, so the utilizing simulation can define it's own creature and have it managed
// * live-neat manages Population and evolution
// * utilizing simulation manages fitness and calls population.step as appropriate

interface ICreature {
  new (...rest: any[]): Creature;
}

interface Dependencies {
  Creature: ICreature,
  context: InnovationContext,
}

function comparator(a: Species, b: Species): number {
  return a.fitness - b.fitness
}

const empty = {
  species: new CompetitiveSet<Species>({ limit: 0, comparator }),
  expressor: {},
  resources: 0,
  age: 0
}

class _Population extends Record(empty) {

  get livingSpecies(){
    return this.species.filter((s, i) => s.size)
  }

  get size(): number {
    return this.species.reduce((s, { size }) => s + size, 0)
  }

  constructor(CreatureClass: ICreature = Creature, context = new InnovationContext(), seed?: Genome) {
    this.mutator = new Mutator(context)
    this.expressor = new GeneExpresser(context)

    this.Creature = CreatureClass
    let size = configurator().population.initialSize
    this.mutator.seed(size, seed).forEach(genome =>
      this.add(new this.Creature(this.expressor.express(genome))))
  }

  get creatures(){
    let creatures: Creature[] = []
    for (let species of this.species) {
      creatures = creatures.concat(Array.from(species.creatures))
    }
    return creatures
  }

  get heroes(){
    let heroes: any[] = []
    for (let species of this.species) {
      heroes = heroes.concat(species.heroes)
    }
    return heroes.sort((a, b) => b.fitness - a.fitness).slice(0, 5)
  }

  forEachCreature(func: Function): void {
    for (let species of this.species) {
      for (let creature of species.creatures) {
        func(creature, species)
      }
    }
  }

  kill(creature: Creature, species: Species): boolean {
    creature.kill()
    let wasAHero = species.kill(creature)
    return wasAHero 
  } 


  buryTheDead(): Array<Creature> {
    // TODO select dead, handle keep alives, then kill
    let keepAlives: Creature[] = []
    this.forEachCreature((creature, species) => {
      if (creature.energy <= 0){
        if(this.size <= configurator().population.minSize){
          let baby = this.reproduce()
          this.add(baby)
          keepAlives.push(baby)
        }
        this.kill(creature, species)
      }
    })
    return keepAlives
  }

  add(creature: Creature) {
    let speciated = false
    for (let species of this.species){
      speciated = species.add(creature)
      if (speciated){
        break
      }
    }
    if (!speciated){
      this.species = this.species.add(new Species(creature))
    }
  }

  selectSpecies(){
    return weightedSelection(Array.from(this.species), s => s.fitness ^ 2)
  }

  reproduce(): Creature {
    let genome = this.mutator.mutate(this.selectSpecies().procreate())
    let network = this.expressor.express(genome)
    return new this.Creature(network)
  }

  attemptReproduction(): Creature | void {
    let { desiredRate, requiredResources } = configurator().reproduction
    if (Math.random() < desiredRate) {
      this.resources -= requiredResources
      let creature = this.reproduce()
      this.add(creature)
      return creature
    }
  }

  // destroy poor performing and stagnating species
  cull() {
    let { culling, stagnation, speciesCount } = configurator().speciation
    if(this.age % culling.regularity){
      this.species
        .filter(({ age }) => age >= culling.minimumAge)
    }
    if(this.species.size > speciesCount){
      // cull bottom (size - count) species
    }
  }

  step(): Array<Creature> {
    let keepAlives = this.buryTheDead() // TODO this also handles keep alive, which is kinda dumb
    this.age++
    this.species.map(s => s.age++) // TODO internal state
    this.cull()
    if(this.resources > configurator().reproduction.requiredResources){
      let baby = this.attemptReproduction()
      if(baby) {
        keepAlives.push(baby)
      }
    }
    return keepAlives
  }

  static fromSerialized(network: string, CreatureClass: ICreature = Creature): Population {
    let { context, genome } = deserialize(network)
    return new Population(CreatureClass, context, genome)
  }

}

export default class Population {
  species: Set<Species> = Set();
  Creature: ICreature;
  mutator: Mutator;
  expressor: GeneExpresser;
  resources: number = 0;
  age: number = 0;
  size: number = 0; // SIZE IS MANAGED MANUALLY

  get livingSpecies(){
    return this.species.filter(s => s.creatures.size)
  }

  constructor(CreatureClass: ICreature = Creature, context = new InnovationContext(), seed?: Genome) {
    this.mutator = new Mutator(context)
    this.expressor = new GeneExpresser(context)

    this.Creature = CreatureClass
    let size = configurator().population.initialSize
    this.mutator.seed(size, seed).forEach(genome =>
      this.add(new this.Creature(this.expressor.express(genome))))
  }

  get creatures(){
    let creatures: Creature[] = []
    for (let species of this.species) {
      creatures = creatures.concat(Array.from(species.creatures))
    }
    return creatures
  }

  get heroes(){
    let heroes: any[] = []
    for (let species of this.species) {
      heroes = heroes.concat(species.heroes)
    }
    return heroes.sort((a, b) => b.fitness - a.fitness).slice(0, 5)
  }

  forEachCreature(func: Function): void {
    for (let species of this.species) {
      for (let creature of species.creatures) {
        func(creature, species)
      }
    }
  }

  kill(creature: Creature, species: Species): boolean {
    creature.kill()
    let wasAHero = species.kill(creature)
    this.size--
    return wasAHero 
  } 


  buryTheDead(): Array<Creature> {
    // TODO select dead, handle keep alives, then kill
    let keepAlives: Creature[] = []
    this.forEachCreature((creature, species) => {
      if (creature.energy <= 0){
        if(this.size <= configurator().population.minSize){
          let baby = this.reproduce()
          this.add(baby)
          keepAlives.push(baby)
        }
        this.kill(creature, species)
      }
    })
    return keepAlives
  }

  add(creature: Creature) {
    let speciated = false
    for (let species of this.species){
      speciated = species.add(creature)
      if (speciated){
        break
      }
    }
    if (!speciated){
      this.species = this.species.add(new Species(creature))
    }
    this.size++
  }

  selectSpecies(){
    return weightedSelection(Array.from(this.species), s => s.fitness ^ 2)
  }

  reproduce(): Creature {
    let genome = this.mutator.mutate(this.selectSpecies().procreate())
    let network = this.expressor.express(genome)
    return new this.Creature(network)
  }

  attemptReproduction(): Creature | void {
    let { desiredRate, requiredResources } = configurator().reproduction
    if (Math.random() < desiredRate) {
      this.resources -= requiredResources
      let creature = this.reproduce()
      this.add(creature)
      return creature
    }
  }

  // destroy poor performing and stagnating species
  cull() {
    let { culling, stagnation, speciesCount } = configurator().speciation
    if(this.age % culling.regularity){
      this.species
        .filter(({ age }) => age >= culling.minimumAge)
    }
    if(this.species.size > speciesCount){
      // cull bottom (size - count) species
    }
  }

  step(): Array<Creature> {
    let keepAlives = this.buryTheDead() // TODO this also handles keep alive, which is kinda dumb
    this.age++
    this.species.map(s => s.age++) // TODO internal state
    this.cull()
    if(this.resources > configurator().reproduction.requiredResources){
      let baby = this.attemptReproduction()
      if(baby) {
        keepAlives.push(baby)
      }
    }
    return keepAlives
  }

  static fromSerialized(network: string, CreatureClass: ICreature = Creature): Population {
    let { context, genome } = deserialize(network)
    return new Population(CreatureClass, context, genome)
  }

}

