import Creature from './creature/Creature'
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

export default function generationBoard(genes){
  let board = new Board({ rows: genes.length, columns: genes.length })
  let creatures = genes.map(genome => new Creature({ genome }))
  creatures.forEach(creature => board.addActor(board.randomEmptyPosition(), creature))
  let wantedPlants = genes.length * 10
  while(wantedPlants){
    board.addObject(board.randomEmptyPosition(), plant())
    wantedPlants--
  }
  return { board, creatures }
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
