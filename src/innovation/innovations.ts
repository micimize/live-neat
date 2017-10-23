import { Diff, StrictSubset, CERTAINLY_IS, thread, compose } from '../utils'
import { Record } from 'immutable'
import { deepmerge as merge } from 'deepmerge'
import * as random from '../random-utils'
import configurator from '../configurator'
import {
  InnovationChronicle as Chronicle,
  InnovationMap,
  PotentialConnection,
  PotentialNode 
} from './chronicle'

type Innovatable = Diff<keyof Chronicle, 'innovation' | keyof Record<any>>
type Update<I extends Innovatable> = StrictSubset<Chronicle, I | 'innovation'> 
type NodeUpdate = Update<'nodes'>
type ConnectionUpdate = Update<'connections'>

function innovate<
  Type,
  A extends Innovatable,
  Result = Update<A>
>(
  chronicle: Chronicle, attribute: A, value: Type
): Result {
  let innovation = chronicle.innovation + 1
  let aspect = chronicle[attribute]
  let r = {
    innovation,
    [attribute]: CERTAINLY_IS<InnovationMap<Type>>(aspect) && aspect.set(innovation, value)
  }
  if(CERTAINLY_IS<Result>(r))
    return r
  throw Error(`cannot innovate ${attribute} with ${value}`)
}

function withInnovation<
  Type, A extends Innovatable, Result = Chronicle
>(chronicle: Chronicle, attribute, value): Chronicle {
  return chronicle.merge(innovate(chronicle, attribute, value))
}

function chooseActivation(chronicle: Chronicle){
  return random.selection(Array.from(chronicle.activations.keys()))
}

function newNode(
  chronicle,
  node: PotentialNode = { activation: chooseActivation(chronicle) }
): Update<'nodes'> {
  return innovate(chronicle, 'nodes', node)
}

function existingConnection(chronicle, connection: PotentialConnection): ConnectionUpdate | false {
  if (configurator().genome.connection.maintainStructuralUniqueness) {
    for (let [innovation, existing] of chronicle.connections.entries()) {
      if(existing.equals(connection)){
        return innovation
      }
    }
  }
  return false
}

function newConnection(
  chronicle: Chronicle, 
  connection: PotentialConnection,
): ConnectionUpdate {
  return existingConnection(chronicle, connection) ||
    innovate(chronicle, 'connections', connection)
}

function insertNode(
  chronicle: Chronicle, 
  { from , to }: PotentialConnection,
): Update<'nodes' | 'connections'> {
  let { innovation, nodes } = newNode(chronicle)
  return thread(
    { innovation, nodes },
    update => merge(update, newConnection(chronicle.merge(update), { from, to: innovation })),
    update => merge(update, newConnection(chronicle.merge(update), { from: innovation, to })),
  )
}


export { withInnovation, newNode, newConnection, insertNode, Update, Innovatable }


/* failed experiments in high level programming

type C = { chronicle: chronicle }

function chronicleualize<
  Up extends { update?: Update<Innovatable> } = { update?: Update<Innovatable> } 
>(f: ({ chronicle, ...inbound }: C & any) => { update?: Up } & any){
  type Full = { chronicle: chronicle, inbound: any }
  return ({ chronicle, ...inbound }: C & any): C & any => {
    let { update, ...outbound }: Up & any = f({ chronicle, ...inbound })
    return { chronicle: chronicle.merge(update || {}), ...outbound }
  }
}

function threadUpdates<
  R extends any = any,
  U extends Update<Innovatable> = Update<Innovatable>,
  Up = { update?: U },
  Updater = (
    { chronicle, update, ...inbound }: { chronicle: chronicle, update?: U, inbound: R },
    f?: Updater
  ) => Up & R
>(data: C & Up & R, ...fs: Array<Updater>){
  fs.reduce(
    <Updater>({ chronicle, update = {}, ...inbound }, f) => {
      let { update: u = {}, ...outbound }: Up & any = f({ chronicle, ...inbound })
      return { chronicle: chronicle.merge(u), update: merge(update, u), ...outbound }
    },
    data
  )
}
*/
