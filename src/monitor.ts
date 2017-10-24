import { Set } from 'immutable'
import { Population, step } from './population'
import { Creature } from './creature'
import { Genome } from './genome'
import * as chalk from 'chalk'
import { max, median, standardDeviation } from 'simple-statistics'

function summarizeComplexity({ connections }: Genome) {
  return Object.assign(
    connections.reduce(({ nodes, latestInnovation }, { from, to }, innovation) =>
      ({
        latestInnovation: innovation > latestInnovation ? innovation : latestInnovation,
        nodes: nodes.add(from).add(to)
      }),
      { nodes: Set<number>(), latestInnovation: 0 }
    ),
    { connections: connections.size }
  )
}

interface Stats {
  min: Creature,
  max: Creature,
  allTime: Creature,
  stddev: number,
  median: number,
  mean: number,
}

function resurrectHero(population: Population): Creature | void {
  let genome = population.heroes.first()
  if(genome){
    let { Creature, chronicle, express } = population
    return new Creature({ genome, network: express({ chronicle, genome }) })
  }
}

function getStats(population: Population): Stats {
  let totalFitness = 0
  let rep = population.creatures.first()
  if (rep === undefined){
    throw Error('empty populations have no stats')
  }
  let { max, min }: Pick<Stats, 'max' | 'min'> = population.creatures.reduce(
    ({ max, min }, c) => (
      totalFitness += c.fitness,
      {
        max: (c.fitness > max.fitness ? c : max),
        min: (c.fitness < min.fitness ? c : min),
      }
    ), { max: rep, min: rep })
  let fitnesses = population.creatures.map(c => c.fitness)
  return {
    max,
    min,
    allTime: resurrectHero(population) || max,
    stddev: standardDeviation(fitnesses),
    median: median(fitnesses),
    mean: totalFitness / population.creatures.size,
  }
}

const defaultFormatters = {
  fitness(f){
    return f.toFixed(3)
  },
  performance({ fitness }){ return this.fitness(fitness) },
  min({ fitness }){
    return 'min: ' + chalk.red(this.fitness(fitness))
  },
  median(f){
    return 'median: ' + chalk.yellow(this.fitness(f))
  },
  mean(f){
    return 'mean: ' + chalk.yellow(this.fitness(f))
  },
  stddev(f){
    return 'stddev: ' + chalk.yellow(f.toFixed(3))
  },

  genome(g: Genome): string {
    let { latestInnovation, nodes, connections } = summarizeComplexity(g)
    let latest = latestInnovation.toString().padStart(4, '_')
    let n = nodes.toString().padStart(3, '_')
    let c = connections.toString().padStart(4, '_')
    return chalk.white(`${latest}I,`) + chalk.whiteBright(`${n}Nx${c}C`)
  },
  creature(c: Creature): string {
    let { id, fitness, genome }  = c
    id = id.toString().padStart(6, '_')
    return `${chalk.green(this.fitness(fitness))} id: ${id} ${this.genome(genome)} ${chalk.cyan(this.performance(c))}`
  },
  max(c){ return 'max: ' + this.creature(c) },
  allTime(c){ return 'best: ' + this.creature(c) },

  stats(s: Stats): string {
    return [ 'min', 'stddev', 'mean', 'median', 'max', 'allTime' ]
      .map(key => this[key](s[key]))
      .join(', ')
  },

  species({ fitness, creatures: { size }}){
    return chalk.white(size) + ` @ ` + chalk.magenta(this.fitness(fitness))
  },

  population(pop){
    return chalk.blue(`gen: ${pop.age} species: [`) + 
      pop.livingSpecies.map(s => this.species(s)).join(', ') +
    chalk.blue(']')
  }

}

export default class Monitor {

  history: Array<any> = []
  formatters: any

  get latest(){
    return this.history[this.history.length-1]
  }

  constructor(formatters = {}) {
    this.formatters = Object.assign(defaultFormatters, formatters)
  }

  stats(population){
    let stats = getStats(population)
    console.log(this.formatters.population(population))
    console.log(this.formatters.stats(stats))
    //console.log(stats.allTime.network.toJSON())
    this.history.push(stats)
  }

}

export class Experiment {
  constructor(public evaluate, public monitor){ }
  generation(population: Population): Population {
    return step(population).map(this.evaluate)
  }
  epoch(population: Population, rounds = 100): Population {
    while (rounds--){
      population = this.generation(population)
    }
    return population
  }
  run(population: Population, epochs=10): Population {
    while (epochs--){
      population = this.epoch(population)
      this.monitor.stats(population)
    }
    return population
  }
}
