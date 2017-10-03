import * as chalk from 'chalk'
import { max, median, standardDeviation } from 'simple-statistics'

function summarizeComplexity(genome) {
  let connections = Object.values(genome)
  let nodes: Set<any> = new Set()
  connections.forEach(({ from, to }) => {
    nodes.add(from)
    nodes.add(to)
  })
  return {
    latestInnovation: max(Object.keys(genome).map(i => Number(i))), 
    nodes: nodes.size,
    connections: connections.length
  }
}

function getStats(population){
  let totalFitness = 0
  let stats: any = population.creatures.reduce(
    ({ max, min }, c) => (
      totalFitness += c.fitness,
      {
        max: (c.fitness > max.fitness ? c : max),
        min: (c.fitness < min.fitness ? c : min),
      }
    ), { max: population.creatures[0], min: population.creatures[0]})
  let fitnesses = population.creatures.map(c => c.fitness)
  stats.stddev = standardDeviation(fitnesses)
  stats.median = median(fitnesses)
  stats.mean = totalFitness / population.creatures.length
  if(population.heroes[0] && population.heroes[0] >= stats.max.allTime){
    let allTime = population.heroes[0]
    stats.allTime = Object.assign({}, allTime, { network: population.expressor(allTime.genome) })
  } else {
    stats.allTime = stats.max
  }
  return stats
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

  genome(g){
    let { latestInnovation, nodes, connections } = summarizeComplexity(g)
    latestInnovation = latestInnovation.toString().padStart(4, '_')
    let n = nodes.toString().padStart(3, '_')
    let c = connections.toString().padStart(4, '_')
    return chalk.white(`${latestInnovation}I,`) + chalk.whiteBright(`${n}Nx${c}C`)
  },
  creature(c){
    let { id, fitness, network: { genome } }  = c
    id = id.toString().padStart(6, '_')
    return `${chalk.green(this.fitness(fitness))} id: ${id} ${this.genome(genome)} ${chalk.cyan(this.performance(c))}`
  },
  max(c){ return 'max: ' + this.creature(c) },
  allTime(c){ return 'best: ' + this.creature(c) },

  stats(s){
    return [ 'min', 'stddev', 'mean', 'median', 'max', 'allTime' ]
      .map(key => this[key](s[key]))
      .join(', ')
  },

  population(pop){
    return chalk.blue(`gen: ${pop.age} species: [`) + 
      pop.livingSpecies.map(s => chalk.magenta(this.fitness(s.fitness))).join(', ') +
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
  generation(population){
    population.step()
    population.creatures.forEach(this.evaluate)
  }
  epoch(population, rounds = 100){
    while (rounds--){
      this.generation(population)
    }
  }
  run(population, epochs=10){
    while (epochs--){
      this.epoch(population)
      this.monitor.stats(population)
    }
  }
}
