import InnovationContext from '../innovation-context'

const serializers = {
  node({ activation, from = {} }) {
    let connections = Object.keys(from).map(k => `${k}*${from[k]}`)
    return `${activation}:${connections.join(',')}` 
  },
  network({ ranges, nodeList }) {
    let { input: [ _, inputs ], output: [ outputStart, outputEnd ]} = ranges
    let outputs: Number = outputEnd - outputStart
    return `${inputs}i${outputs}ob/${nodeList.slice(outputStart).map(serializers.node).join(';')}`
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

function fillNodes(count: number, activation: string, value: number = 0): Array<{ activation, value }> {
  return Array(count)
    .fill(null)
    .map((_) => ({ activation, value }))
}

type SerializedConnection = PotentialConnection & { weight: number }

function getConnectionsFromNode({ id, from = {} }: NNode) {
  return Object.keys(from).reduce((connections, f) => {
    connections.push({ to: id, from: Number(f), weight: from[f] })
    return connections
  }, Array<SerializedConnection>()) 
}

function getConnections(nodeList: Array<NNode>) {
  return nodeList.reduce((connections, node) =>
    connections.concat(getConnectionsFromNode(node)),
    Array<SerializedConnection>()) 
}

function reviveConnections(
  context: InnovationContext, connections: Array<SerializedConnection>
): Genome {
  return connections.reduce((g, connection) => {
    let { innovation } = context.newConnection(connection)
    g[innovation] = {
      innovation,
      active: true,
      ...connection
    }
    return g
  }, {})
}


export function deserialize(network: string): { genome: Genome, context: InnovationContext } {
  let [ properties, nodes ] = network.split('/')
  let { inputs, outputs, bias } = deserializers.properties(properties)
  let ranges = {
    input: [ 0, inputs ],
    output: [ inputs + bias, inputs + bias + outputs ]
  }
  let nodeList = [
    ...fillNodes(inputs, 'input', 0),
    ...fillNodes(bias, 'static', 1),
    ...nodes.split(';').map(deserializers.node)
  ].map((n, id) => ({ id, ...n }))
  let context = new InnovationContext({
    inputs,
    outputs,
    activations: ['sigmoid'],
    opener: 'custom',
  })
  let genome = reviveConnections(context, getConnections(nodeList))
  return { context, genome }
}

