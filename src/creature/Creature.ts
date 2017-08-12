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
  weight = 5;
  age = 0;
  consumed = 0;
  energy = 100;
  brain: any = {};

  constructor({ /*color,*/ genome }: { /*color: [ number, number, number ],*/ genome: any }) {
    this.genome = genome
    //this.color = color
    this.brain = brain(genome) 
  }

  vision(board, position: PiecePosition){
    return getSurroundings({ board, position, range: 2 })
  }

  thinkAbout(vision: any[]){
    return this.brain.think([ this.age, this.weight, this.energy, ...flattenRGBs(vision) ])
  }

  process({ energy, action }: { energy: number, action: string }){
    this.age += 1
    let cost: number = (
      /* 10 additional or 100 connections require one more energy */ 
      Math.floor(this.brain.complexity / 10) +
      /*  every 5 years requires 1 more energy to get through */ 
      Math.floor(this.age / 5)
    )
    if(energy < 0){
      this.consumed += energy
    }
    this.energy = Math.max(this.energy - energy - cost, 0)
    this.color = [ 0, 0, 155 + Math.floor(this.energy / 10)]
  }

  isDead(){
    if(this.energy <= 0){
      this.color = [ 0, 0, 100 ]
      return true
    }
    return false
  }

  plan = async (board) => {
    let { direction, action } = this.thinkAbout(this.vision(board, this.position))
    this.direction = direction
    this.action = action
    return true
  }
}
