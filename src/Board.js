function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const moves = {
  'right': [ 0,  1],
  'left':  [ 0, -1],
  'up':    [-1,  0],
  'down':  [ 1,  0],
}

export default class Board {
  constructor({ rows, columns }) {
    this.dimensions = { rows, columns }
    this.board = Array(rows).fill().map(_ => Array(columns).fill()) 
    this.actors = new Set()
  }
  addObject(row, column, object){
    this.board[row][column] = object
  }
  addActor(row, column, cell){
    this.board[row][column] = cell
    this.actors.add([row, column].join(','))
  }
  attemptMove({ force, direction, row, column }){
    // attempt to move cell from given row and column
    // has force & direction if part of a reaction chain, otherwise, we'll begin a chain with force equal to weight
    if (force === undefined && direction === undefined) {
      let { weight, direction: d } = this.board[row][column]
      force = weight
      direction = moves[ d ]
    }
    if(direction === undefined || force === undefined){
      return false
    }
    let targetRow = row + direction[0] // TODO hard to understand
    let targetColumn = column + direction[1]

    // we can't move outside the board
    if (
      targetRow < 0 ||
      targetColumn < 0 ||
      targetRow >= this.dimensions.rows ||
      targetColumn >= this.dimensions.columns
    ) {
      return false
    }

    let target = this.board[targetRow][targetColumn]
    if (target){

      // if we can't move the cell we're targetting, attempt fails
      if(force < target.weight){
        return false
      } else {

        // if we can't move whatever is behind the cell we're targetting, attempt fails
        if (!this.attemptMove({
          force: force - target.weight,
          direction,
          row: targetRow,
          column: targetColumn
        })){
          return false
        }
      }
    }
    //this.board[row][column].direction = undefined
    this.board[targetRow][targetColumn] = this.board[row][column]
    this.board[row][column] = undefined
    let sig = [row, column].join(',')
    if (this.actors.has(sig)){
      this.actors.delete(sig)
      this.actors.add([targetRow, targetColumn].join(','))
    }
    return true
  }

  resolveMoves() {
    shuffle(Array.from(this.actors))
      .map(sig => sig.split(',').map(i => parseInt(i, 10)))
      .map(([row, column]) => 
        this.attemptMove({ row, column }))
  }
}
