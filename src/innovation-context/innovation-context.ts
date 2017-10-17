import { Map } from 'immutable'
import Structure from './structure'
import * as random from '../random-utils'
import configurator from '../configurator'
import { nNodes, openers } from './functions' // this isn't the best name wise

interface Config {
  inputs: number,
  outputs: number,
  opener: 'single-connection' | 'single-hidden-node' | 'fully-connected' | 'custom',
  activations: Array<string>
  // 'sigmoid', 'tanh', 'relu', 'gaussian', 'sin', 'cos', 'abs', 'mult', 'add', 'mult', 'add'
}

interface Mutated {
  context: InnovationContext
}

interface Innovation {
  innovation: number
}

class InnovationContext extends Structure {

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
      update: { connections:  Map.of([ [ innovation, { from, to } ] ]) }
    }
  }

  node({ from, to }: PotentialConnection){
    // ugly, hard to make not ugly
    let newNode = this.newNode()
    let newFrom = newNode.context.connection({ from, to: newNode.node.innovation })
    let { update: { connections }, context } = newFrom.context.connection({ from: newNode.node.innovation, to })
    return { context, update: { connections: connections.concat(newFrom.update.connections) } }
  }

  from({
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
export default InnovationContext