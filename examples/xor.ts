import Population, { Creature } from '../src'

  /*
class XORCreature extends Creature {
  process(fitness: number): void {
    this.fitness = fitness
    this.energy = 0
  }
}*/

let population = new Population()//XORCreature)

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
  let fitness = domain.reduce((total, [ input, output ]) =>
    (total + correctness(output, creature.think(input)[0])), 0
  ) / domain.length
  creature.process(fitness * 10)
}

function predictionAccuracy(creature){
  let total = domain.reduce((total, [ input, output ]) =>
    (total + Number(output == Math.round(creature.think(input)[0]))),
    0
  )
  return `${total} / ${domain.length}`
}

population.creatures.forEach(evaluate)

function generation() {
  population.step()
  population.creatures.forEach(evaluate)
}

function epoch(rounds = 100){
  while (rounds--){
    generation()
  }
}

function getStats(){
  let stats: any = population.creatures.reduce(
    ({ total, max, min }, { fitness }) => ({
      total: total + fitness,
      max: (fitness > max ? fitness : max),
      min: fitness < min ? fitness : min
    }),
    { total: 0, max: 0, min: Infinity }
  )
  stats.avg = stats.total / population.creatures.length

  let best = population.creatures.reduce((m, c) => c.fitness > m.fitness ? c : m)
  stats.bestPrediction = predictionAccuracy(best)


  stats.allTime = population.heroes[0].fitness
  stats.species = population.species.map(s => s.fitness.toFixed(3)).join(', ')
  delete stats.total
  return Object.entries(stats).reduce((str, [stat, val]) => str + `
    ${stat}:\t${typeof(val) === 'number' ? val.toFixed(3) : val}`,
    `\nage ${population.age}:`
  )
}


function evaluatePerformance(epochs = 10){
  while (epochs--){
    epoch()
    console.log(getStats())
  }
}
const genomeOf = index => population.creatures[index].network.genome

epoch(3)

//population.creatures[0].network

evaluatePerformance()

