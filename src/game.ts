import Creature from './creature/Creature'
import Board from './Board'

function plant(): Food {
  return {
    position: { row: NaN, column: NaN },
    age: 0,
    color: [ 0, 255, 0 ],
    energy: 1000,
    weight: 5
  }
}

export default function generationBoard(genes){
  let board = new Board({ rows: genes.length, columns: genes.length })
  let creatures = genes.map(genome => new Creature({ genome }))
    .forEach(creature => board.addActor(board.randomEmptyPosition(), creature))
  let wantedPlants = genes.length * 4
  while(wantedPlants){
    board.addObject(board.randomEmptyPosition(), plant())
    wantedPlants--
  }
  return board
}
