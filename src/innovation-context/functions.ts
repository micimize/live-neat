import { Map } from 'immutable-ext'

interface Context {
  innovation: number
  activations: Map<number, ActivationRef>
  nodes: Map<number, PotentialNode>
  connections: Map<number, PotentialConnection>
  innovate: (attribute: 'activations' | 'nodes' | 'connections', value) => Context
}

function hiddenNodes(){
  return fromEntries(
    Object.entries(this.nodes).filter(([id, { type }]) => !type || type === 'HIDDEN')
  )
}

export function nNodes<Context extends { innovate }>(
  context: Context,
  { type, activation },
  count: number
): Context {
  while (count) {
    context = context.innovate('nodes', { type, activation })
    count--
  }
  return context
}

function getNodesOfType(context: Context, nodeType: 'INPUT' | 'BIAS' | 'OUTPUT' | 'HIDDEN'): number[] {
  return context.nodes.keys().filter(
    k => context.nodes.get(k).type === nodeType)
}

function fullyConnectedOpener(context: Context): Context{
  let inputs = getNodesOfType(context, 'INPUT')
  let outputs = getNodesOfType(context, 'OUTPUT')
  return inputs.reduce((context, from) =>
    outputs.reduce((context, to) =>
      context.connection({ from, to }).context, context), context)
}

export const openers = {
  'fully-connected': fullyConnectedOpener
}