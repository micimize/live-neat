// A creature is a piece with { age, action, direction, genome }
// brain is a neural network that operates based on vision
// brain signature is ([ age, weight, energy ...unrolledVision ]) => ({ action X direction })
// each turn costs minimum 1 energy + weight if moving

import brain from './network'
import { flattenRGBs, getSurroundings } from './visionUtils'

export default class Creature implements CreaturePiece {

  action: 'push' | 'pull' | 'bite' | null = null;
  direction: 'right' | 'left' | 'up' | 'down' = 'down';
  position = { row: 0, column: 0 };
  color = 'blue';
  weight = 5;
  age = 0;
  energy = 100;

  constructor({ color, genome }: { color: [ number, number, number ] }) {
    this.genome = genome
    this.color = color
    this.think = brain(genome) 
  }

  vision(board){
    let position = this.position
    return getSurroundings({ board, position, range: 2 })
  }
  thinkAbout(vision: any[]){
    return this.think([ this.age, this.weight, this.energy, ...flattenRGBs(vision) ])
  }
  planMove(board){
    let { direction, action } = this.thinkAbout(this.vision(board))
    this.direction = direction
    this.action = action
  }
}
