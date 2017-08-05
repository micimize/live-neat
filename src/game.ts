import Creature from './creature/Creature'
import Board from './Board'

export default function generationBoard(genes){
  let board = new Board({ rows: genes.length, columns: genes.length })
  let creatures = genes.map(genome => new Creature({ genome }))
    .forEach(creature => board.addActor(board.randomEmptyPosition(), creature))
  return board
}
