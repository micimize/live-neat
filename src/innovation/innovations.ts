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
  context: Chronicle, attribute: A, value: Type
): Result {
  let innovation = context.innovation + 1
  let aspect = context[attribute]
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
>(context: Chronicle, attribute, value): Chronicle {
  return context.merge(innovate(context, attribute, value))
}

function chooseActivation(context: Chronicle){
  return random.selection(Array.from(context.activations.keys()))
}

function newNode(
  context,
  node: PotentialNode = { activation: chooseActivation(context) }
): Update<'nodes'> {
  return innovate(context, 'nodes', node)
}

function existingConnection(context, connection: PotentialConnection): ConnectionUpdate | false {
  if (configurator().genome.connection.maintainStructuralUniqueness) {
    for (let [innovation, existing] of context.connections.entries()) {
      if(existing.equals(connection)){
        return innovation
      }
    }
  }
  return false
}

function newConnection(
  context: Chronicle, 
  connection: PotentialConnection,
): ConnectionUpdate {
  return existingConnection(context, connection) ||
    innovate(context, 'connections', connection)
}

function insertNode(
  context: Chronicle, 
  { from , to }: PotentialConnection,
): Update<'nodes' | 'connections'> {
  let { innovation, nodes } = newNode(context)
  return thread(
    { innovation, nodes },
    update => merge(update, newConnection(context.merge(update), { from, to: innovation })),
    update => merge(update, newConnection(context.merge(update), { from: innovation, to })),
  )
}


export { withInnovation, newNode, newConnection, insertNode, Update, Innovatable }


/* failed experiments in high level programming

type C = { context: Context }

function contextualize<
  Up extends { update?: Update<Innovatable> } = { update?: Update<Innovatable> } 
>(f: ({ context, ...inbound }: C & any) => { update?: Up } & any){
  type Full = { context: Context, inbound: any }
  return ({ context, ...inbound }: C & any): C & any => {
    let { update, ...outbound }: Up & any = f({ context, ...inbound })
    return { context: context.merge(update || {}), ...outbound }
  }
}

function threadUpdates<
  R extends any = any,
  U extends Update<Innovatable> = Update<Innovatable>,
  Up = { update?: U },
  Updater = (
    { context, update, ...inbound }: { context: Context, update?: U, inbound: R },
    f?: Updater
  ) => Up & R
>(data: C & Up & R, ...fs: Array<Updater>){
  fs.reduce(
    <Updater>({ context, update = {}, ...inbound }, f) => {
      let { update: u = {}, ...outbound }: Up & any = f({ context, ...inbound })
      return { context: context.merge(u), update: merge(update, u), ...outbound }
    },
    data
  )
}
*/
