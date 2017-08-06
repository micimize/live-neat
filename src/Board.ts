import { shuffle } from './utils'
import * as actions from './creature/actions'

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

function randomPosition({ rows, columns }: { rows: number, columns: number }) {
  return {
    row: Math.floor(Math.random() * rows),
    column: Math.floor(Math.random() * columns),
  }
}

export default class Board implements GameBoard {
  dimensions: { rows: number, columns: number };
  actors: Set<string>;
  deadActors: Set<string>;
  board: any[];
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
  addActor({ row, column }: PiecePosition, creature: CreaturePiece){
    creature.position = { row, column }
    this.board[row][column] = creature
    this.actors.add([row, column].join(','))
  }
  moveActor({ from, to }: PieceMovement){
    let sig = serializePiecePosition(from)
    if (this.actors.has(sig)){
      this.actors.delete(sig)
      this.actors.add(serializePiecePosition(to))
    }
  } killActor(position: PiecePosition){
    let sig = serializePiecePosition(position)
    if (this.actors.has(sig)){
      this.actors.delete(sig)
      this.deadActors.add(sig)
    }
  }
  retrieveAllDeadActors(){
    return Array.from(this.deadActors)
      .map(deserializePiecePosition)
      .map(position => this.getCell(position))
  }
  retrieveAllLivingActors(){
    return Array.from(this.actors)
      .map(deserializePiecePosition)
      .map(position => this.getCell(position))
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
    cell.direction = undefined

    this.setCell(to, { overwrite: cell })
    this.setCell(from, { overwrite: undefined })

    this.moveActor({ from, to })
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
    let { energy, age } = this.getCell(newPosition)
    age += 1
    energy += (-force + remainingForce - Math.floor((age / 50) ** 2))
    energy = energy < 0 ? 0 : energy
    this.setCell(newPosition, { merge: {
      direction: undefined,
      action: undefined,
      energy,
      color: [ 0, 0, 155 + Math.floor(energy / 10)],
      age
    }})
  }

  checkForDeath(creature: CreaturePiece){
    if(creature.energy <= 0){
      creature.color = [ 0, 0, 100 ]
      creature.genome.fitness = -(creature.age ** 2)
      this.killActor(creature.position)
    }
  } 

  resolveMoves(){
    let actors = shuffle(Array.from(this.actors))
      .map(deserializePiecePosition)
      .map(position => this.getCell(position))
    actors.forEach(a => a.planMove(this))
    actors.forEach(a => this.attemptMove(a))
    actors.forEach(a => this.checkForDeath(a))
  }

  getState(){
    return {
      board: this.board,
      living: this.retrieveAllLivingActors(),
      dead: this.retrieveAllDeadActors()
    }
  }

  turn(){
    this.resolveMoves()
    return this.getState()
  }

}
