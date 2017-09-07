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

let rounds = 1000
while (rounds--){ step() }

population.creatures[0].network.nodeList
population.creatures[0].network.genome
