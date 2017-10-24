import { InnovationChronicle, InnovationMap, PotentialConnection, PotentialNode } from './chronicle'
import { withInnovation, newNode, newConnection } from './innovations'
import { thread, compose } from '../utils'
import  { deepmerge as merge } from 'deepmerge'
import configurator from '../configurator'

function hiddenNodes(chronicle: InnovationChronicle){
  return InnovationMap<PotentialNode>(
    Object.entries(chronicle.nodes).filter(([id, { type }]) => !type || type === 'HIDDEN')
  )
}

function hiddenNodeActivations(chronicle: InnovationChronicle){
  let nodes = hiddenNodes(chronicle)
  return Object.keys(nodes)
    .reduce((nodeAct, n) => (nodeAct[n] = chronicle.activations[nodes[n]], nodeAct), {})
}

function withNodes(
  chronicle: InnovationChronicle,
  { type, activation }: PotentialNode,
  count: number
): InnovationChronicle {
  return chronicle.withMutations(chronicle => {
    while (count) {
      chronicle.merge(newNode(chronicle, { type, activation }))
      count--
    }
  })
}

function getNodesOfType(chronicle: InnovationChronicle, nodeType: 'INPUT' | 'BIAS' | 'OUTPUT' | 'HIDDEN'): number[] {
  return Array.from(chronicle.nodes.keys()).filter(k => {
    if (k) {
      let node = chronicle.nodes.get(k)
      return !node ? false : node.type || 'HIDDEN' === nodeType
    }
    return false
  })
}

function fullyConnectedOpener(initial: InnovationChronicle): InnovationChronicle {
  let inputs = getNodesOfType(initial, 'INPUT')
  let outputs = getNodesOfType(initial, 'OUTPUT')
  return inputs.reduce((chronicle, from) =>
    chronicle.merge(outputs.reduce((inner, to) =>
      chronicle.merge(newConnection(inner, { from, to })),
      chronicle
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
): InnovationChronicle {
    let chronicle = activations.reduce((chronicle, a) => withInnovation(chronicle, 'activations', a),
      InnovationChronicle.empty()
    )
    chronicle = withNodes(chronicle, { type: 'INPUT', activation: 0 }, inputs)
    chronicle = withNodes(chronicle, { type: 'BIAS', activation: 1 }, 1)
    // hardcoded: output is first activation
    chronicle = withNodes(chronicle, { type: 'OUTPUT', activation: 1 }, outputs)
    return openers[opener](chronicle)
}

export { hiddenNodeActivations, getNodesOfType, fromConfiguration }