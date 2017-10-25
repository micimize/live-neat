import { ConnectionGene } from '../genome'
import { Network } from './network'

type NodeReference = number

interface BaseParameters {
  inputs: Array<NodeReference>,
  bias: Array<NodeReference>,
  outputs: Array<NodeReference>,
  outputActivation: string
}

export default class NodeListPacker implements Network.Data {
  readonly translator: { [nodeReference: number]: number };
  readonly nodeList: Array<Network.Node>;
  readonly ranges: {
    input: Network.NodeRange
    output: Network.NodeRange
  };
  constructor({ inputs, bias, outputs, outputActivation = 'sigmoid' }: BaseParameters){
    // TODO outputActivation is baked into the entire system, but should be flexible on a per-neuron basis
    let nodeList: Array<Network.Node> = inputs.sort().map(innovation => ({
      innovation,
      value: 0,
      activation: 'input'
    }))
    let translator = inputs.reduce((t, input, index) => (t[input] = index, t), {})

    translator[bias[0]] = nodeList.push({
      innovation: bias[0], value: 1, activation: 'static'
    }) - 1

    let ranges = {
      input: [ 0, inputs.length ],
      output: [ nodeList.length, nodeList.length + outputs.length ]
    }

    outputs.sort().forEach(output => {
      translator[output] = nodeList.push({
        innovation: output,
        activation: outputActivation,
        value: 0,
        from: {}
      }) - 1
    })

    Object.assign(this, { translator, ranges, nodeList })
  }

  fromConnections(connections: Array<ConnectionGene>, activations): Array<Network.Node> {
    let nodeList: Array<Network.Node> = this.nodeList.map(({ from, ...node }) =>
      Object.assign(from ? { from: Object.assign({}, from) } : {}, node))
    let translator = Object.assign({}, this.translator)

    // add all "to" nodes 
    connections.forEach(({ to: innovation }) => {
      if (!translator[innovation]){
        // translate from innovation to index
        translator[innovation] = nodeList.push({
          innovation,
          activation: activations.get(innovation),
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
          if(node.activation !== 'sigmoid'){
            debugger;
          }
          node.from[translator[from]] = weight
        }
      }
    })
    return nodeList
  }

}
