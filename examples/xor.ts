import { Population, Creature, Configuration } from '../src'
import { Monitor, Experiment } from '../src/monitor'
import { shuffle } from 'simple-statistics'

class XORCreature extends Creature {
  step(fitness: number): XORCreature {
    return this.withMutations(creature => {
      creature.fitness = fitness
      creature.energy = 0
    })
  }
}

let population = new Population({
  Creature: XORCreature,
  configuration: {
    reproduction: {
      includeHeroGenesRate: 1.00
    },
    mutation: {
      newNodeProbability: 0.03,
      newConnectionProbability: 0.05,
      connection: {
        disable: 0.01,
        reenable: 0.00,
      },
    },
    innovation: {
      chronicle: {
        connections: {
          unique: false
        }
      }
    },
    speciation: {
      speciesCount: 4,
      stagnation: {
        cost: 1.5,
      },
      heroes: {
        count: 12
      }
    }
  }
})

const domain = [
  [ [ 0, 0 ], 0 ],
  [ [ 0, 1 ], 1 ],
  [ [ 1, 0 ], 1 ],
  [ [ 1, 1 ], 0 ]
]/*.map(([ a, b ]) =>
  ([ [ a, b ], a ^ b ]))*/

type Performance = { confidence: number, success: number }

function CorrectnessWeighter(weights: Performance, exp: number = 2) {
  const total = Object.values(weights).reduce((a, b) => a + b)
  return (performance: Performance) => ((
    Object.entries(performance).reduce(
      (sum, [ metric, value ]) => sum + (weights[metric] * value), 0
    ) / total
  ) ** exp )
}

  // success is 2x more important than confidence
const weighter = CorrectnessWeighter({ confidence: 1, success: 0 })

function gotAnswer(actual: number, prediction: number): number {
  return Number(actual == Math.round(prediction))
}

function correctness(actual: number, prediction: number | null): number {
  if(prediction === null){
    console.log('network somehow buggy')
    debugger
    return 0
  }
  let success = gotAnswer(actual, prediction) 
  let confidence = 1 - (actual - prediction) ** 2
  return weighter({ success, confidence })
}

function evaluate(creature: XORCreature): XORCreature {
  let fitness = shuffle(domain).reduce((total, [ input, output ]) =>
    (total + correctness(output, creature.think(input)[0])),
    0
  ) // domain.length
  return creature.step(fitness)
}

const formatters = {
  fitness(f){
    return `${(f / 4 * 100).toFixed(2)}%`
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
