import Creature from './creature/Creature'
import Population from './live-neat'
import Board from './Board'

function plant(): Food {
  return {
    position: { row: NaN, column: NaN },
    age: 0,
    color: [ 0, 255, 0 ],
    energy: 5000,
    weight: 4
  }
}

let population = new Population(Creature)

export default function generationBoard(){
  let board = new Board({ rows: genes.length, columns: genes.length, population })
  let wantedPlants = population.size * 10
  while(wantedPlants--){
    board.addObject(board.randomEmptyPosition(), plant())
  }
  return board
}


const maxFit = genes =>
  genes.map(({ fitness }) => Math.sqrt(fitness))
    .reduce((max, f = 0) => f > max ? f : max, 0)

export async function offline({ species, board, rounds }){
  console.log(board)
  let round = 0
  while(round < rounds){
    while(board.turn().living.length){
      continue
    }
    species.applyFitnessFunc()
    species.evolve()
    board = generationBoard(species.genes)
    round++
  }
  return { species, board }
}
