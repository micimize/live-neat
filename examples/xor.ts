import { Population, Creature } from '../src'
import Monitor, { Experiment } from '../src/monitor'
import { shuffle } from 'simple-statistics'

class XORCreature extends Creature {
  step(fitness: number): XORCreature {
    return this.withMutations(creature => {
      creature.fitness = fitness
      creature.energy = 0
    })
  }
}

let population = new Population({ Creature: XORCreature })

const domain = [
  [ 0b0, 0b0 ],
  [ 0b0, 0b1 ],
  [ 0b1, 0b0 ],
  [ 0b1, 0b1 ],
].map(([ a, b ]) =>
  ([ [ a, b ], a ^ b ]))

function gotAnswer(actual: number, prediction: number){
  return Number(actual == Math.round(prediction))
}

function correctness(actual: number, prediction: number | null): number {
  if(prediction === null){
    return 0
  }
  let success = gotAnswer(actual, prediction) 
  let confidence = 1 - (actual - prediction) ** 2
  // success is 2x more important than confidence
  return ((2 * success + confidence) / 3) ** 2
}

function evaluate(creature: XORCreature): XORCreature {
  let fitness = shuffle(domain).reduce((total, [ input, output ]) =>
    (total + correctness(output, creature.think(input)[0])), 0
  ) / domain.length
  return creature.step(fitness)
}

const formatters = {
  fitness(f){
    return `${(f * 100).toFixed(2)}%`
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
