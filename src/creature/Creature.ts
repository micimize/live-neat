// A creature is a piece with { age, action, direction, genome }
// extends the creature class from live-neat for management by Population
// each turn costs minimum 1 energy + weight if moving

import NeatCreature from '../live-neat/creature'
import { networkDecoder } from '../live-neat/utils'
import { flattenRGBs, getSurroundings } from './vision-utils'

const decode = networkDecoder({
  action: [ 'push', 'pull', 'bite', null ],
  direction: [ 'right', 'left', 'up', 'down' ]
})


export default class Creature extends NeatCreature implements CreaturePiece {

  position: PiecePosition = { row: NaN, column: NaN };
  action: 'push' | 'pull' | 'bite' | null = null;
  direction: 'right' | 'left' | 'up' | 'down' = 'down';
  color: [ number, number, number ] = [ 0, 0, 255 ];
  weight = 5;
  age = 0;
  consumed = 0;
  energy = 100;

  vision(board, position: PiecePosition){
    return getSurroundings({ board, position, range: 2 })
  }

  thinkAbout(vision: any[]){
    return decode(this.think([ this.age / 100.0, this.weight / 5.0, this.energy / 100.0 , ...flattenRGBs(vision) ]))
  }

  process({ energy, action }: { energy: number, action: string }){
    this.age += 1
    let cost: number = (
      /* 10 additional or 100 connections require one more energy */ 
      // Math.floor(this.network.complexity / 10) + TODO reimplement
      /*  every 5 years requires 1 more energy to get through */ 
      Math.floor(this.age / 5)
    )
    if(energy < 0){
      this.consumed += energy
    }
    this.energy = Math.max(this.energy - energy - cost, 0)
    this.color = [ 0, 0, 155 + Math.floor(this.energy / 10)]
  }


  kill() {
    this.color = [ 0, 0, 100 ]
  }

  plan = async (board) => {
    let { direction, action } = this.thinkAbout(this.vision(board, this.position))
    this.direction = direction
    this.action = action
    return true
  }
}
