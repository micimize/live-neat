import * as fs from 'fs'
import { Set } from 'immutable'
import { Population, step } from './population'
import { Creature } from './creature'
import { Genome } from './genome'
import * as chalk from 'chalk'
import { max, median, standardDeviation } from 'simple-statistics'

/*
 *  import * as memwatch from 'memwatch-next'
 *  function profileLog(data){
 *      return fs.appendFileSync('profile.json', JSON.stringify(data, null, 2) )
 *  }
 *  memwatch.on('leak', profileLog)
 *  memwatch.on('stats', profileLog)
 *    //let hd = new memwatch.HeapDiff();
 *    //profileLog(hd.end())
 */

function summarizeComplexity({ connections }: Genome) {
  let { nodes, latestInnovation } = connections.reduce(
    ({ nodes, latestInnovation }, { from, to }, innovation) => ({
      latestInnovation: innovation > latestInnovation ? innovation : latestInnovation,
      nodes: nodes.add(from).add(to)
    }),
    { nodes: Set<number>(), latestInnovation: 0 }
  )
  return {
    latestInnovation,
    nodes: nodes.size,
    connections: connections.size,
  }
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
function best({ allTime, max }: Stats): Creature {
  return allTime.fitness > max.fitness ?
    allTime :
    max
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
  let fitnesses = population.creatures.map(c => c.fitness).toArray()
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
    let idPadded = id.toString().padStart(6, '_')
    return `${chalk.green(this.fitness(fitness))} id: ${idPadded} ${this.genome(genome)} ${chalk.cyan(this.performance(c))}`
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

  configuration({ speciation: { compatibility: { threshold }} }){
    return `t/h: ${threshold}`
  },

  population(pop){
    let conf = this.configuration(pop.configuration)
    return chalk.blue(
      `${new Date().toISOString()} gen: ${pop.age}, ${conf}, ${pop.livingSpecies.size} species: [`
    ) +
      pop.livingSpecies.map(s => this.species(s)).join(', ') +
    chalk.blue(']')
  }

}

class Monitor {

  history: Array<any> = []
  formatters: any

  get latest(){
    return this.history[this.history.length - 1]
  }

  constructor(formatters = {}) {
    this.formatters = Object.assign(defaultFormatters, formatters)
  }

  stats(population): Stats {
    let stats = getStats(population)
    console.log(this.formatters.population(population))
    console.log(this.formatters.stats(stats))
    //console.log(stats.allTime.network.toJSON())
    this.history.push(stats)
    return stats
  }

}

class Experiment {
  constructor(
    public evaluate: (creature: Creature) => Creature,
    public monitor,
    public desiredFitness: number = 3.5
  ){ }
  generation(population: Population): Population {
    return step(population).map(this.evaluate)
  }
  epoch(population: Population, rounds = 10): Population {
    while (rounds --> 0){
      population = this.generation(population)
    }
    return population
  }
  run(population: Population, epochs=1000): Population {
    population = population.map(this.evaluate)
    while (epochs --> 0){
      population = this.epoch(population)
      let stats = this.monitor.stats(population)
      if (best(stats).fitness >= this.desiredFitness){
        console.log('success!')
      }
    }
    return population
  }
}

export { Experiment, Monitor }