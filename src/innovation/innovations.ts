import { Diff, StrictSubset, CERTAINLY_IS, thread, compose } from '../utils'
import { Record } from 'immutable'
import * as random from '../random-utils'
import configurator from '../configurator'
import Configuration from './configuration'
import {
  Chronicle,
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

function existingConnection(chronicle: Chronicle, connection: PotentialConnection): ConnectionUpdate | false {
  if (Configuration().chronicle.connections.unique) {
    for (let [innovation, { from, to}] of chronicle.connections.entries()) {
      if(connection.from == from && connection.to == to){
        let connections = Chronicle.empty().connections.set(innovation, connection)
        return { innovation, connections }
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


function newConnections({
  chronicle,
  connections,
}: {
  chronicle: Chronicle,
  connections: Array<PotentialConnection>,
}): Update<'connections'> {
  return connections.reduce((update, connection) => {
    chronicle = chronicle.merge(update)
    let { innovation, connections } = newConnection(chronicle, connection)
    return { innovation, connections: connections.merge(update.connections) }
  }, {
    innovation: chronicle.innovation,
    connections: Chronicle.empty().connections
  })
}


function insertNode(
  chronicle: Chronicle, 
  { from , to }: PotentialConnection,
): Update<'nodes' | 'connections'> {
  let node = newNode(chronicle)
  return Object.assign(
    node,
    newConnections({
      chronicle: chronicle.merge(node),
      connections: [
        { from, to: node.innovation },
        { from: node.innovation, to }
      ]
    })
  )
}


export {
  withInnovation,
  newNode,
  newConnection,
  newConnections,
  insertNode,
  Update,
  Innovatable
}


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
