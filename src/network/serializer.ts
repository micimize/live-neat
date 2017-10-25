import { Genome, initialize  } from '../genome'
import { innovations, fromConfiguration } from '../innovation'
import Configuration from '../innovation/configuration'
import { Chronicle, PotentialConnection } from '../innovation/chronicle'
import { Network } from './network'

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

function getConnectionsFromNode({ id, from = {} }: Network.Node) {
  return Object.keys(from).reduce((connections, f) => {
    connections.push({ to: id, from: Number(f), weight: from[f] })
    return connections
  }, Array<SerializedConnection>()) 
}

function getConnections(nodeList: Array<Network.Node>) {
  return nodeList.reduce((connections, node) =>
    connections.concat(getConnectionsFromNode(node)),
    Array<SerializedConnection>()) 
}

function reviveConnections(
  chronicle: Chronicle,
  connections: Array<SerializedConnection>
): { genome: Genome, chronicle: Chronicle } {
  let update = innovations.newConnections({ chronicle, connections })
  return {
    chronicle: chronicle.merge(update),
    genome: Genome.of({ connections: initialize.connections(update.connections) })
  }
}


export function deserialize(network: string): { genome: Genome, chronicle: Chronicle } {
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
  let chronicle = fromConfiguration(
    Configuration().setIn(['chronicle', 'initialize'], {
      inputs,
      outputs,
      activations: ['sigmoid'],
      opener: 'custom',
    })
  )
  return reviveConnections(chronicle, getConnections(nodeList))
}

