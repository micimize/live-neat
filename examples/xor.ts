exports = {}
import Population from './'
import { selection } from './random-utils' 
let population = new Population()

const domain = [
  [ 0b0, 0b0 ],
  [ 0b0, 0b1 ],
  [ 0b1, 0b0 ],
  [ 0b1, 0b1 ],
].map(([ a, b ]) => ({
  input: [ a, b ],
  output: [ a ^ b ]
}))


function step() {
  let { input, output: [ actual ] } = selection(domain)

  const toEnergy = prediction =>
    Math.floor(10 * (1 - (actual - prediction[0]) ** 2))

  population.creatures.forEach(creature =>
    creature.process(toEnergy(creature.think(input))))

  population.step()
}

function epoch(rounds = 100000){
  while (rounds--){ step() }
}

function getStats(population){
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


function evaluatePerformance(epochs = 10){
  while (epochs--){
    epoch()
    console.log(getStats(population))
  }
}
