import * as I from 'immutable'
import { ConnectionGene } from '../genome'
import { should, within } from '../random-utils'
import { bounder } from '../utils'
import Configuration from './configuration'

type Conn = { from: number, to: number }
type Connections = I.Map<number, ConnectionGene>

export function checkForCycle(connections: Array<Conn>, testing: Conn): boolean{
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


function canDisable(disabling: ConnectionGene, connections: Connections): boolean {
  for(let { from, to, active } of connections.values()){
    if (disabling.from == from && disabling.to !== to && active){
      return true
    }
  }
  return false
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
    active(connection: ConnectionGene, connections: Connections): boolean {
      return connection.active ?
        !(should(disable) && canDisable(connection, connections)) :
        should(reenable)
    }
  }
}


function mutater(configuration: Configuration['connection']){
  let { weight, active } = connectionMutations(configuration)
  return function mutate(conns: Connections): Connections {
    return conns.withMutations(connections => {
      for(let [innovation, connection] of connections){
        // need to mutate connections to avoid batch disabling otherwise canDisable connections
        connections.set(innovation, connection
          .update('weight', weight)
          .set('active', active(connection, connections)))
      }
    })
  }
}

export { mutater }