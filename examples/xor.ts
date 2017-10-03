import Population, { Creature } from '../src'
import Monitor, { Experiment } from '../src/monitor'
import { shuffle } from 'simple-statistics'

class XORCreature extends Creature {
  process(fitness: number): void {
    this.fitness = fitness
    this.energy = 0
  }
}

let population = new Population(XORCreature)

const domain = [
  [ 0b0, 0b0 ],
  [ 0b0, 0b1 ],
  [ 0b1, 0b0 ],
  [ 0b1, 0b1 ],
].map(([ a, b ]) =>
  ([ [ a, b ], a ^ b ]))

function correctness(actual, prediction){
  return 1 - (actual - prediction) ** 2
}

function evaluate(creature){
  let fitness = shuffle(domain).reduce((total, [ input, output ]) =>
    (total + correctness(output, creature.think(input)[0])), 0
  ) / domain.length
  creature.process(fitness * 10)
}

const formatters = {
  fitness(f){
    return `${(f * 10).toFixed(2)}%`
  },
  performance(creature) {
    let total = shuffle(domain).reduce((total, [input, output]) =>
      (total + Number(output == Math.round(creature.think(input)[0]))),
      0
    )
    return `${total}/${domain.length}`
  }
}

let monitor = new Monitor(formatters)

let experiment = new Experiment(evaluate, monitor)

experiment.run(population)
