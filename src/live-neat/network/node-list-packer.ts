import { Node, Range, NetworkData } from './type'
import { ConnectionGene  } from '../genome/connection-gene'

type NodeReference = number

interface BaseParameters {
  inputs: Array<NodeReference>,
  bias: Array<NodeReference>,
  outputs: Array<NodeReference>,
  outputActivation: string
}

export default class NodeListPacker implements NetworkData {
  readonly translator: { [nodeReference: number]: number };
  readonly nodeList: Array<Node>;
  readonly ranges: {
    input: Range
    output: Range
  };
  constructor({ inputs, bias, outputs, outputActivation = 'sigmoid' }: BaseParameters){
    let nodeList: Array<Node> = inputs.sort().map(() => ({ value: 0 }))
    let translator = inputs.reduce((t, i) => (t[i] = i, t), {})

    translator[bias[0]] = nodeList.push({ value: 1 }) - 1

    let ranges = {
      input: [ 0, inputs.length - 1 ],
      output: [ nodeList.length, nodeList.length + outputs.length - 1 ]
    }

    outputs.sort().forEach(output => {
      translator[output] = nodeList.push({ activation: outputActivation, value: 0, from: {} }) - 1
    })

    Object.assign(this, { translator, ranges, nodeList: nodeList })
  }

  fromConnections(connections: Array<ConnectionGene>, activations): Array<Node> {
    let nodeList = Array.from(this.nodeList)
    let translator = Object.assign({}, this.translator)

    // add all "to" nodes 
    connections.forEach(({ to: id }) => {
      if (!translator[id]){
        translator[id] = nodeList.push({ activation: activations[id], value: 0, from: {} }) - 1
      }
    })

    // only add "from" to node if it is relevant
    connections.forEach(({ from, to, weight }) => {
      if (translator[from]){
        let node = nodeList[translator[to]]
        if (node.from) {
          node.from[translator[from]] = weight
        }
      }
    })
    return nodeList
  }
}
