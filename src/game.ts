import Creature from './creature/creature'
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
  let size = population.size
  let board = new Board({ rows: size, columns: size, population })
  let wantedPlants = population.size * 10
  while(wantedPlants--){
    board.addObject(board.randomEmptyPosition(), plant())
  }
  return board
}


