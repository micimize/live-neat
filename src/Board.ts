import { shuffle } from './utils'

const moves = {
  'right': [ 0,  1],
  'left':  [ 0, -1],
  'up':    [-1,  0],
  'down':  [ 1,  0],
}

function serializePiecePosition({ row, column }: PiecePosition){
  return [row, column].join(',')
}

function deserializePiecePosition(sig: string){
  let [ row, column ] = sig.split(',').map(i => parseInt(i, 10))
  return { row, column }
}

export default class Board implements GameBoard {
  dimensions: { rows: number, columns: number };
  actors: Set<string>;
  board: any[];
  constructor({ rows, columns }: { rows: number, columns: number }) {
    this.dimensions = { rows, columns }
    this.board = new Array(rows)
      .fill(undefined)
      .map(() => new Array(columns).fill(undefined)) 
    this.actors = new Set()
  }
  addObject(piece: Piece){
    let { row, column } = piece.position
    this.board[row][column] = piece
  }
  addActor(creature: Creature){
    let { row, column } = creature.position
    this.board[row][column] = creature
    this.actors.add([row, column].join(','))
  }
  moveActor({ from, to }: PieceMovement){
    let sig = serializePiecePosition(from)
    if (this.actors.has(sig)){
      this.actors.delete(sig)
      this.actors.add(serializePiecePosition(to))
    }
  }
  setCell({ row, column }: PiecePosition, { merge, overwrite }: { merge?: object, overwrite?: object }){
    if(merge){
      let cell = this.board[row][column] || {}
      this.board[row][column] = Object.assign(cell, merge)
    } else {
      this.board[row][column] = overwrite
    }
  }
  getCell({ row, column }: PiecePosition){
    return this.board[row][column]
  }
  move({ from, to }: PieceMovement){
    this.setCell(from, { merge: { direction: undefined } })
    this.setCell(to, { overwrite: this.getCell(from) })
    this.setCell(from, { overwrite: undefined })
    this.moveActor({ from, to })
    return true
  }
  isInBounds({ row, column }: PiecePosition){
    return row < 0 ||
      column < 0 ||
      row >= this.dimensions.rows ||
      column >= this.dimensions.columns
  }
  attemptMove({ force, action, direction, row, column }: any){
    // attempt to move cell from given row and column
    // has force & direction if part of a reaction chain, otherwise, we'll begin a chain with force equal to weight
    if (force === undefined && direction === undefined) {
      let { weight, direction: d, action: a = 'push' } = this.board[row][column]
      force = weight
      direction = moves[ d ]
      action = a
    }
    if(direction === undefined || force === undefined){
      return [ false, 0 ]
    }
    let target = {
      row: row + direction[0], // TODO hard to understand
      column: column + direction[1]
    }
    // we can't push or pull outside the board
    if (!this.isInBounds(target)) {
      return [ false, 0 ]
    }

    if ( action === 'pull' ) {
      let targetCell = this.getCell(target)
      if (!targetCell) {
        this.move({ from: { row, column }, to: target })
        return [ true, force ]
      }
      let backingInto = {
        row: row - direction[0], // TODO hard to understand
        column: column - direction[1]
      }
      if (!this.isInBounds(backingInto)) {
        return [ false, 0 ]
      }
      if(force < targetCell.weight){
        return [ false, 0 ]
      } else {
        this.move({ from: { row, column }, to: backingInto })
        this.move({ from: target, to: { row, column } })
        return [ true, force ] 
      }
    }

    let targetCell = this.getCell(target)
    if (targetCell){

      // if we can't move the cell we're targetting, attempt fails
      if(force < targetCell.weight){
        return [ false, 0 ]
      } else {

        // if we can't move whatever is behind the cell we're targetting, attempt fails
        let [ success, f ] = this.attemptMove({
          force: force - targetCell.weight,
          direction,
          ...target
        })
        if (!success){
          return [ false, 0 ]
        }
        force = f
      }
    }
    this.move({ from: { row, column }, to: target })
    return [ true, force ] 
  }

  resolveMoves() {
    shuffle(Array.from(this.actors))
      .map(deserializePiecePosition)
      .map(position => this.attemptMove(position))
  }

  vision() {
  }
}
