import { InnovationContext, InnovationMap, PotentialConnection, PotentialNode } from './innovation-context'
import { withInnovation, newNode, newConnection } from './innovations'
import { thread, compose } from '../utils'
import  { deepmerge as merge } from 'deepmerge'
import configurator from '../configurator'

function hiddenNodes(context){
  return InnovationMap<PotentialNode>(
    Object.entries(context.nodes).filter(([id, { type }]) => !type || type === 'HIDDEN')
  )
}

function withNodes(
  context: InnovationContext,
  { type, activation }: PotentialNode,
  count: number
): InnovationContext {
  return context.withMutations(context => {
    while (count) {
      context.merge(newNode(context, { type, activation }))
      count--
    }
  })
}

function getNodesOfType(context: InnovationContext, nodeType: 'INPUT' | 'BIAS' | 'OUTPUT' | 'HIDDEN'): number[] {
  return Array.from(context.nodes.keys()).filter(k => {
    if (k) {
      let node = context.nodes.get(k)
      return !node ? false : node.type === nodeType
    }
    return false
  })
}

function fullyConnectedOpener(initial: InnovationContext): InnovationContext {
  let inputs = getNodesOfType(initial, 'INPUT')
  let outputs = getNodesOfType(initial, 'OUTPUT')
  return inputs.reduce((context, from) =>
    context.merge(outputs.reduce((inner, to) =>
      context.merge(newConnection(inner, { from, to })),
      context
    )),
    initial
  )
}

export const openers = {
  'fully-connected': fullyConnectedOpener
}

interface Config {
  inputs: number,
  outputs: number,
  opener: 'single-connection' | 'single-hidden-node' | 'fully-connected' | 'custom',
  activations: Array<string>
  // 'sigmoid', 'tanh', 'relu', 'gaussian', 'sin', 'cos', 'abs', 'mult', 'add', 'mult', 'add'
}

function fromConfiguration({
    inputs, outputs, opener = 'fully-connected', activations = ['sigmoid']
  } = configurator().initialNetwork
): InnovationContext {
    let context = activations.reduce((context, a) => withInnovation(context, 'activations', a),
      InnovationContext.empty()
    )
    context = withNodes(context, { type: 'INPUT', activation: 0 }, inputs)
    context = withNodes(context, { type: 'BIAS', activation: 1 }, 1)
    // hardcoded: output is first activation
    context = withNodes(context, { type: 'OUTPUT', activation: 1 }, outputs)
    return openers[opener](context)
}

export { fromConfiguration }