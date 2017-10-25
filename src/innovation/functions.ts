import { Chronicle, InnovationMap, PotentialConnection, PotentialNode } from './chronicle'
import { withInnovation, newNode, newConnection } from './innovations'
import { thread, compose } from '../utils'
import  { deepmerge as merge } from 'deepmerge'
import Configuration from './configuration'

function hiddenNodes(chronicle: Chronicle){
  return InnovationMap<PotentialNode>(
    Array.from(chronicle.nodes.entries())
      .filter(([id, { type }]) => !type || type === 'HIDDEN')
  )
}

function hiddenNodeActivations(chronicle: Chronicle): InnovationMap<Chronicle.Activation> {
  return hiddenNodes(chronicle).map(({ activation }) =>
    chronicle.activations.get(activation) || 'sigmoid')
}

function withNodes(
  chronicle: Chronicle,
  { type, activation }: PotentialNode,
  count: number
): Chronicle {
  return chronicle.withMutations(chronicle => {
    while (count) {
      chronicle.merge(newNode(chronicle, { type, activation }))
      count--
    }
  })
}

function getNodesOfType(chronicle: Chronicle, nodeType: 'INPUT' | 'BIAS' | 'OUTPUT' | 'HIDDEN'): number[] {
  return Array.from(chronicle.nodes.keys()).filter(k => {
    if (k) {
      let node = chronicle.nodes.get(k)
      return !node ? false : (node.type || 'HIDDEN') === nodeType
    }
    return false
  })
}

function fullyConnectedOpener(initial: Chronicle): Chronicle {
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

function fromConfiguration(
  {
    chronicle: {
      initialize: {
        inputs, outputs, opener, activations
      }
    }
  }: Configuration = Configuration()
): Chronicle {
    let chronicle = activations.reduce((chronicle, a) => withInnovation(chronicle, 'activations', a),
      Chronicle.empty()
    )
    chronicle = withNodes(chronicle, { type: 'INPUT', activation: 0 }, inputs)
    chronicle = withNodes(chronicle, { type: 'BIAS', activation: 1 }, 1)
    // TODO hardcoded: output is first activation, which is the first real innovation which we "know" is 2
    chronicle = withNodes(chronicle, { type: 'OUTPUT', activation: 2 }, outputs)
    return openers[opener](chronicle)
}

export { hiddenNodeActivations, getNodesOfType, fromConfiguration }