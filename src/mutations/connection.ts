import { ConnectionGene } from '../genome'
import configurator from '../configurator'

let conf = configurator().mutation.connection
type Configuration = typeof conf

function should(probability: number): boolean {
  return Math.random() < probability
}

function connectionMutations(configuration: Configuration){
  return {
    weight(weight: number): number {
      let { weightChange } = configuration
      return weight + (should(weightChange.probability) ?
        (Math.random() * 2 - 1) * weightChange.power :
        0)
    },
    active(active: boolean): boolean {
      let { reenable, disable } = configuration
      return active ?
        !should(disable) :
        should(reenable)
    }
  }
}

function mutate(connection: ConnectionGene): ConnectionGene {
  let { weight, active } = connectionMutations(configurator().mutation.connection)
  return connection
      .update('weight', weight)
      .update('active', active)
}

export { mutate }