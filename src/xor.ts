/*
exports = {}
import * as xor from './xor'
xor.epoch(3)
xor.population.creatures[0].network
*/

import Population, { Creature } from './'

  /*
export class XORCreature extends Creature {
  process(fitness: number): void {
    this.fitness = fitness
    this.energy = 0
  }
}*/

export let population = new Population()//XORCreature)

export const domain = [
  [ 0b0, 0b0 ],
  [ 0b0, 0b1 ],
  [ 0b1, 0b0 ],
  [ 0b1, 0b1 ],
].map(([ a, b ]) =>
  ([ [ a, b ], a ^ b ]))

export function correctness(actual, prediction){
  return 1 - (actual - prediction) ** 2
}

export function evaluate(creature){
  let fitness = domain.reduce((total, [ input, output ]) =>
    (total + correctness(output, creature.think(input)[0])), 0
  ) / domain.length
  creature.process(fitness * 10)
}

population.creatures.forEach(evaluate)

export function generation() {
  population.step()
  population.creatures.forEach(evaluate)
}

export function epoch(rounds = 100000){
  while (rounds--){
    generation()
  }
}

export function getStats(){
  let stats: any = population.creatures.reduce(
    ({ total, max, min }, { fitness }) => ({
      total: total + fitness,
      max: fitness > max ? fitness : max,
      min: fitness < min ? fitness : min
    }),
    { total: 0, max: 0, min: Infinity }
  )
  stats.avg = stats.total / population.creatures.length
  stats.age = population.age
  stats.allTime = population.heroes[0].fitness
  delete stats.total
  return stats
}


export function evaluatePerformance(epochs = 10){
  while (epochs--){
    epoch()
    console.log(getStats())
  }
}
export const genomeOf = index => population.creatures[index].network.genome
