import { Map } from 'immutable'
import { Record } from 'immutable'
import * as random from '../random-utils'
import configurator from '../configurator'
import { nNodes, openers } from './functions' // this isn't the best name wise

function emptyDefaults(o): object {
  let e = {}
  Object.keys(o).forEach(k => e[k] = undefined)
  return e
}

type ActivationRef = 'INPUT' | 'BIAS' | 'sigmoid' | 'tanh' | 'relu'

interface Config {
  inputs: number,
  outputs: number,
  opener: 'single-connection' | 'single-hidden-node' | 'fully-connected' | 'custom',
  activations: Array<ActivationRef>
  // 'sigmoid', 'tanh', 'relu', 'gaussian', 'sin', 'cos', 'abs', 'mult', 'add', 'mult', 'add'
}

const empty = {
  innovation: 2,
  activations: Map<number, ActivationRef>([ [ 0, 'INPUT' ], [ 1, 'BIAS' ] ]),
  nodes: Map<number, PotentialNode>(),
  connections: Map<number, PotentialConnection>() 
}

interface Context {
  innovation: number
  activations: Map<number, ActivationRef>
  nodes: Map<number, PotentialNode>
  connections: Map<number, PotentialConnection> 
}

interface Mutated {
  context: InnovationContext
}

interface Innovation {
  innovation: number
}

interface IContext extends Context {
  innovate: (attribute: 'activations' | 'nodes' | 'connections', value) => Mutated & Innovation
}

export default class InnovationContext extends Record(empty) implements IContext {

  constructor(context: Context = empty) {
    super(context)
  }

  innovate(attribute: 'activations' | 'nodes' | 'connections', value): Mutated & Innovation {
    let context = this.set('innovation', this.innovation + 1)
    let innovation = context.innovation
    context = context.setIn([attribute, context.innovation], value)
    return { innovation, context }
  }

  private newNode(): Mutated & { node: { activation: number } & Innovation } {
    let activation: number = random.selection(Array.from(this.activations.keys()))
    let { context, innovation } = this.innovate('nodes', activation)
    return { context, node: { innovation, activation } }
  }

  connection({ from, to }: PotentialConnection){
    let { innovation, context } = this.innovate('connections', { from, to })
    return {
      context,
      update: { connections:  Map([ [ innovation, { from, to } ] ]) }
    }
  }

  node({ from, to }: PotentialConnection){
    // ugly, hard to make not ugly
    let newNode = this.newNode()
    let newFrom = newNode.context.connection({ from, to: newNode.node.innovation })
    let { update: { connections }, context } = newFrom.context.connection({ from: newNode.node.innovation, to })
    return { context, update: { connections: connections.concat(newFrom.update.connections) } }
  }

  of({
    inputs, outputs, opener = 'fully-connected', activations = ['sigmoid']
  } = configurator().initialNetwork){
    
    let context = new InnovationContext()
    context = activations.reduce((context,a) => context.innovate('activations', a).context, context)
    context = nNodes(context, { type: 'INPUT', activation: 0 }, inputs)
    context = nNodes(context, { type: 'BIAS', activation: 1 }, 1)
    // hardcoded: output is first activation
    context = nNodes(context, { type: 'OUTPUT', activation: 1 }, outputs)
    return openers[opener](context)
  }

}
