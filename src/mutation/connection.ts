import * as I from 'immutable'
import { ConnectionGene } from '../genome'
import { should, within } from '../random-utils'
import { bounder } from '../utils'
import Configuration from './configuration'

type Conn = { from: number, to: number }

export function checkForCycle(connections: I.Set<Conn>, testing: Conn): boolean{
  let visited = new Set<number>([ testing.from ])
  while (true) {
    let newVisits = 0
    for (let { from, to } of connections){
      if (visited.has(from) && !visited.has(to)) {
        if (to === testing.to){
          return true
        }
        visited.add(to)
        newVisits += 1
      }
    }
    if(!newVisits){
      return false
    }
  }
}


function connectionMutations({ weightChange, reenable, disable }: Configuration['connection']){
  let bound = bounder(weightChange.bounds)
  return {
    weight(weight: number): number {
      return bound(weight + (
        should(weightChange.probability) ?
          within(-1, 1) * weightChange.power :
          0
      ))
    },
    active(active: boolean): boolean {
      return active ? !should(disable) : should(reenable)
    }
  }
}

function mutater(configuration: Configuration['connection']){
  let { weight, active } = connectionMutations(configuration)
  return function mutate(connection: ConnectionGene): ConnectionGene {
    return connection
        .update('weight', weight)
        .update('active', active)
  }
}

export { mutater }