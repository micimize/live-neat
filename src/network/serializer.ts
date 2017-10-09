import InnovationContext from '../innovation-context'
import NodeListPacker from './node-list-packer'

function serializers = {
  node({ activation, from = {} }: Node) {
    let connections = Object.keys(from).map(k => `${k}*${from[k]}`)
    return `${activation}:${connections.join(',')}` 
  }
  network({ ranges, nodeList }) {
    let { input: [ _, inputs ], output: [ outputStart, outputEnd ]} = ranges
    let outputs: Number = outputEnd - outputStart
    return `${inputs}i${outputs}ob/${.nodeList.slice(outputStart).map(serializeNode).join(';')}`
  }
}

const deserializers = {
  properties(properties: string)  {
    let [ inputs, outputs, , bias = false ] = properties.split(/i|o|b/g)
    return {
      bias: bias ? 1 : 0,
      inputs: Number(inputs),
      outputs: Number(outputs),
    }
  },
  node(node: string)  {
    let [ activation, ...connections ] = node.split(/:|,/)
    let from = connections.reduce((m, c) => {
      let [ source, weight ] = c.split('*')
      m[source] = Number(weight)
      return m
    }, {})
    return { activation, from, value: 0 }
  }
}

function fillNodes(count: number, { activation, value }: Node): Array<{ activation, value }> {
  return Array(count)
    .fill(null)
    .map((_) => ({ activation, value }))
}

function getConnectionsFromNode({ id, from }: Node) {
  return Object.keys(from).reduce((connections, f) => {
    connections.push({ to: id, from: f, weight: from[f] })
    return connections
  }, []) 
}

function getConnections(nodeList: Array<Node>) {
  return nodeList.reduce((connections, node) =>
    connections.concat(getConnectionsFromNode(node)), [])
}


export function deserialize(network: string): { genome: Genome, context: InnovationContext } {
  let [ properties, nodes ] = network.split('/')
  let { inputs, outputs, bias } = deserialize.properties(properties)
  let ranges = {
    input: [ 0, inputs ],
    output: [ inputs + bias, inputs + bias + outputs ]
  }
  let nodeList = [
    ...fillNodes(inputs, { 'input' }),
    ...fillNodes(bias, 'static', 1),
    ...nodes.split(';').map(deserialize.node)
  ].map((n, id) => ({ id, ...n }))
  let context = new InnovationContext({
    inputs,
    outputs,
    activations: ['sigmoid'],
    opener: 'custom',
  })
  let genome = getConnections(nodeList).reduce((g, connection) => {
    let { innovation } = context.newConnection(connection)
    connection.innovation = innovation
    g[innovation] = connection
    return g
  }, {})
  return { context, genome }
}

