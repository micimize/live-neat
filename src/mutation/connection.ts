import { ConnectionGene } from '../genome'
import Configuration from './configuration'

function should(probability: number): boolean {
  return Math.random() < probability
}

function connectionMutations({ weightChange, reenable, disable }: Configuration['connection']){
  return {
    weight(weight: number): number {
      return weight + (should(weightChange.probability) ?
        (Math.random() * 2 - 1) * weightChange.power :
        0)
    },
    active(active: boolean): boolean {
      return active ?
        !should(disable) :
        should(reenable)
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