import { shuffle } from './random-utils'
import * as actions from './creature/actions'

const moves = {
  'right': [ 0,  1],
  'left':  [ 0, -1],
  'up':    [-1,  0],
  'down':  [ 1,  0],
}

function randomPosition({ rows, columns }: { rows: number, columns: number }) {
  return {
    row: Math.floor(Math.random() * rows),
    column: Math.floor(Math.random() * columns),
  }
}

export default class Board implements GameBoard {
  dimensions: { rows: number, columns: number };
  actors: Set<CreaturePiece>;
  deadActors: Set<CreaturePiece>;
  board: any[];
  moving: boolean = false;
  constructor({ rows, columns }: { rows: number, columns: number }) {
    this.dimensions = { rows, columns }
    this.board = new Array(rows)
      .fill(undefined)
      .map(() => new Array(columns).fill(undefined)) 
    this.actors = new Set()
    this.deadActors = new Set()
  }
  addObject({ row, column }: PiecePosition, piece: Piece){
    piece.position = { row, column }
    this.board[row][column] = piece
  }
  addActor(position: PiecePosition, creature: CreaturePiece){
    this.addObject(position, creature)
    this.actors.add(creature)
  }
  killActor(creature: CreaturePiece){
    this.actors.delete(creature)
    this.deadActors.add(creature)
  }
  setCell({ row, column }: PiecePosition, value: any){
    this.board[row][column] = value
  }
  getCell({ row, column }: PiecePosition){
    return this.board[row][column]
  }
  randomEmptyPosition(){
    let position = randomPosition(this.dimensions)
    while (this.getCell(position)){
      position = randomPosition(this.dimensions)
    }
    return position
  }
  move({ from, to }: PieceMovement){
    let cell = this.getCell(from)
    cell.position = to
    this.setCell(to, cell)
    this.setCell(from, undefined)

    return true
  }
  isInBounds({ row, column }: PiecePosition){
    return !(
      row < 0 ||
      column < 0 ||
      row >= this.dimensions.rows ||
      column >= this.dimensions.columns
    )
  }
  attemptMove({ weight: force, direction, action, position }: CreaturePiece){
    // attempt to move cell from given row and column
    // has force & direction if part of a reaction chain, otherwise, we'll begin a chain with force equal to weight
    let [ _, remainingForce, newPosition ] = (direction && action) ?
      actions[action](position, { force, direction: moves[direction] }, this) :
      [ true, force, position ]
    let creature = this.getCell(newPosition)
    creature.process({ energy: remainingForce - force, action })
  }

  checkForDeath(creature: CreaturePiece){
    if(creature.isDead()){
      this.killActor(creature)
    }
  } 

  resolveMoves = async () => {
    await Promise.all(Array.from(this.actors).map(a => a.plan(this)))
    shuffle(Array.from(this.actors))
      .forEach(a => this.attemptMove(a))
    this.actors.forEach(a => this.checkForDeath(a))
  }

  getState(){
    return {
      board: this.board,
      living: this.actors,
      dead: this.deadActors
    }
  }

  turn = async () => {
    this.moving = true
    this.resolveMoves()
    this.moving = false
    return this.getState()
  }

}
