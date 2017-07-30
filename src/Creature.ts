// A creature is a piece with { action, direction, brain }
// brain is a neural network that operates based on vision
// brain signature is ([ ...unrolledVision, weight, energy ]) => action X direction
// each turn costs minimum 1 energy + weight if moving

function flattenRGBs(cells){
  return cells.reduce((rgbs, { color = [ 0, 0, 0 ] }) =>
    [...rgbs, ...color ], [])
}

function getSurroundings({ board, position: { row, column }, range }){
  let cells = []
  let max = {
    row: row + range,
    column: column + range
  }
  let current = {
    row: row - range,
    column: column - range
  }
  while(current.row <= max.row){
    while(current.column <= max.column){
      cells.push(board.getCell(current))
      current.row--
      current.column--
    }
  }
  return cells
}

export default class Creature implements CreaturePiece {
  constructor({ color }: { color: [ number, number, number ] }) {
  }
  vision(board){
    let position = this.position
    return getSurroundings({ board, position, range: 2 })
  }
  thinkAbout(context){
    let nnOut = applyNeuralNetwork(flattenRGBs(context))
    return interpretNnOut(nnOut)
  }
  planMove(board){
    let { direction, action } = this.thinkAbout(this.vision(board))
    this.direction = direction
    this.action = action
  }
}
