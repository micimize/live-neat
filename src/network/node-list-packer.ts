import { ConnectionGene } from '../genome'

type NodeReference = number

interface BaseParameters {
  inputs: Array<NodeReference>,
  bias: Array<NodeReference>,
  outputs: Array<NodeReference>,
  outputActivation: string
}

export default class NodeListPacker implements NetworkData {
  readonly translator: { [nodeReference: number]: number };
  readonly nodeList: Array<NNode>;
  readonly ranges: {
    input: NodeRange
    output: NodeRange
  };
  constructor({ inputs, bias, outputs, outputActivation = 'sigmoid' }: BaseParameters){
    // TODO outputActivation is baked into the entire system, but should be flexible on a per-neuron basis
    let nodeList: Array<NNode> = inputs.sort().map(id => ({
      id,
      value: 0,
      activation: 'input'
    }))
    let translator = inputs.reduce((t, input, index) => (t[input] = index, t), {})

    translator[bias[0]] = nodeList.push({
      id: bias[0], value: 1, activation: 'static'
    }) - 1

    let ranges = {
      input: [ 0, inputs.length ],
      output: [ nodeList.length, nodeList.length + outputs.length ]
    }

    outputs.sort().forEach(output => {
      translator[output] = nodeList.push({
        id: output,
        activation: outputActivation,
        value: 0,
        from: {}
      }) - 1
    })

    Object.assign(this, { translator, ranges, nodeList })
  }

  fromConnections(connections: Array<ConnectionGene>, activations): Array<NNode> {
    let nodeList: Array<NNode> = this.nodeList.map(({ from, ...node }) =>
      Object.assign(from ? { from: Object.assign({}, from) } : {}, node))
    let translator = Object.assign({}, this.translator)

    // add all "to" nodes 
    connections.forEach(({ to: id }) => {
      if (!translator[id]){
        translator[id] = nodeList.push({
          id,
          activation: activations[id],
          value: 0,
          from: {}
        }) - 1
      }
    })

    // only add "from" to node if it is relevant
    connections.forEach(({ from, to, weight }) => {
      if (translator[from] !== undefined){
        let node = nodeList[translator[to]]
        if (node.from) {
          node.from[translator[from]] = weight
        }
      }
    })
    return nodeList
  }

}
