// A creature is a piece with { action, direction, brain }
// brain is a neural network that operates based on vision
// brain signature is ([ ...unrolledVision, weight, energy ]) => action X direction
// each turn costs minimum 1 energy + weight if moving

function flattenRGBs(cells: any){
  return cells.reduce((rgbs: any, { color = [ 0, 0, 0 ] }) =>
    [...rgbs, ...color ], [])
}

function getSurroundings({ board, position: { row, column }, range }: any){
  let cells: any[] = []
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
  action: 'push' | 'pull' | 'bite' | null = null;
  direction: "right" | "left" | "up" | "down" = 'down';
  position = { row: 0, column: 0 };
  color = 'blue';
  weight = 5;
  energy = 5;

  constructor({ color }: { color: [ number, number, number ] }) {
  }
  vision(board){
    let position = this.position
//  return getSurroundings({ board, position, range: 2 })
  }
//thinkAbout(context){
//  let nnOut = applyNeuralNetwork(flattenRGBs(context))
//  return interpretNnOut(nnOut)
//}
//planMove(board){
//  let { direction, action } = this.thinkAbout(this.vision(board))
//  this.direction = direction
//  this.action = action
//}
}
