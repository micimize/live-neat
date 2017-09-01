import { Node, Range, NetworkData } from './type'

type NodeReference = number

interface BaseParameters {
  inputs: Array<NodeReference>,
  bias: Array<NodeReference>,
  outputs: Array<NodeReference>,
  outputActivation: string
}

export default class NodeListPacker implements NetworkData {
  readonly translator: { [nodeReference: number]: number };
  readonly baseNodeList: Array<Node>;
  readonly ranges: {
    input: Range
    output: Range
  };
  constructor({ inputs, bias, outputs, outputActivation = 'sigmoid' }: BaseParameters){
    let nodeList = inputs.sort().map(() => ({ value: 0 }))
    let translator = inputs.reduce((t, i) => (t[i] = i, t), {})

    translator[bias[0]] = nodeList.push({ value: 1 }) - 1

    let ranges = {
      input: [ 0, inputs.length - 1 ],
      output: [ nodeList.length, nodeList.length + outputs.length - 1 ]
    }

    outputs.sort().forEach(output => {
      translator[output] = nodeList.push({ activation: outputActivation, value: 0, from: {} }) - 1
    })

    Object.assign(this, { translator, ranges, baseNodeList: nodeList })
  }

  fromConnections(connections: Array<Connection>, activations): Array<Node> {
    let nodeList = Array.from(this.baseNodeList)
    let translator = Object.assign({}, translator)

    // add all "to" nodes 
    connections.forEach(({ to: id }) => {
      translator[id] = nodeList.push({ activation: activations[id], value: 0, from: {} }) - 1
    })

    // only add "from" to node if it is relevant
    connections.forEach(({ from, to, weight }) => {
      if (translator[from]){
        nodeList[translator[to]].from[translator[from]] = weight
      }
    })
    return nodeList
  }
}
