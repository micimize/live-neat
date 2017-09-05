import { shuffle } from './random-utils'
import * as actions from './creature/actions'
import Population from './live-neat'

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
  population: any;
  board: any[];
  moving: boolean = false;
  living: Set<Food> = new Set();

  constructor({ rows, columns, population }: { rows: number, columns: number, population: any }) {
    this.dimensions = { rows, columns }
    this.board = new Array(rows)
      .fill(undefined)
      .map(() => new Array(columns).fill(undefined)) 

    this.population = population
    this.population.forEachCreature(
      creature => this.addObject(this.randomEmptyPosition(), creature))
  }
  addObject({ row, column }: PiecePosition, piece: Piece){
    piece.position = { row, column }
    this.board[row][column] = piece
    if ('energy' in piece) {
      this.living.add(piece as Food)
    }
  }
  setCell({ row, column }: PiecePosition, value: any){
    this.board[row][column] = value
  }
  getCell({ row, column }: PiecePosition){
    return this.board[row][column]
  }
  randomEmptyPosition(){
    let position = randomPosition(this.dimensions)
    let tries = 0
    while (this.getCell(position)){
      position = randomPosition(this.dimensions)
      if(tries++ > 1000){
        throw Error('dumb shit')
      }
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
  attemptMove(creature: CreaturePiece){
    // attempt to move cell from given row and column
    let { weight: force, direction, action, position } = creature
    let [ _, remainingForce, newPosition ] = (direction && action) ?
      actions[action](position, { force, direction: moves[direction] }, this) :
      [ true, force, position ]
    creature.process({ energy: remainingForce - force, action })
  }

  resolveMoves = /*async*/ () => {
    //await Promise.all(
      this.population.creatures.map(creature => creature.energy && creature.plan(this))
      //)
    /*shuffle(*/this.population.creatures/*)*/
      .forEach(creature => this.attemptMove(creature))
    this.population.step().map(newCreature =>
      this.addObject(this.randomEmptyPosition(), newCreature))
  }

  buryRotten = /*async*/ (turnNumber: number) => {
    for (let organism of this.living) {
      if(organism.energy <= 0 && organism.age + 15 < turnNumber) {
        this.setCell(organism.position, undefined)
        this.living.delete(organism)
      }
    }
  }

  turn = /*async*/ (turnNumber: number) => {
    this.moving = true
    this.resolveMoves()
    this.buryRotten(turnNumber)
    this.moving = false
    return this.population
  }

}
