// A creature is a piece with { age, action, direction, genome }
// brain is a neural network that operates based on vision
// brain signature is ([ age, weight, energy ...unrolledVision ]) => ({ action X direction })
// each turn costs minimum 1 energy + weight if moving

import brain from './network'
import { flattenRGBs, getSurroundings } from './visionUtils'

export default class Creature implements CreaturePiece {

  position: PiecePosition = { row: NaN, column: NaN };
  action: 'push' | 'pull' | 'bite' | null = null;
  genome: any = null;
  direction: 'right' | 'left' | 'up' | 'down' = 'down';
  color: [ number, number, number ] = [ 0, 0, 255 ];
  weight = 10;
  age = 0;
  energy = 200;
  think = _ => _;

  constructor({ /*color,*/ genome }: { /*color: [ number, number, number ],*/ genome: any }) {
    this.genome = genome
    //this.color = color
    this.think = brain(genome) 
  }
  vision(board, position: PiecePosition){
    return getSurroundings({ board, position, range: 2 })
  }
  thinkAbout(vision: any[]){
    return this.think([ this.age, this.weight, this.energy, ...flattenRGBs(vision) ])
  }
  planMove(board){
    let { direction, action } = this.thinkAbout(this.vision(board, this.position))
    this.direction = direction
    this.action = action
  }
}
