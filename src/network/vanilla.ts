import InnovationContext from '../innovation-context'
import Genome from '../genome'
import NodeListPacker from './node-list-packer'
import Network, { Node, Range } from './type'

function values(obj): any[] {
  return Object.keys(obj).map(k => obj[k])
}

const activations = {
  sigmoid(t: number) {
    return 1.0 / ( 1.0 + Math.exp( -t ))
  }
}

class SimpleNetwork implements Network {
  constructor(
    public genome: Genome,
    public nodeList: Array<Node>,
    public ranges
  ){ }

  setInputs(inputs: Array<number>): void {
    // range is [ first, last ] indices
    //assert (inputs.length - 1 == this.ranges.input[1])
    inputs.forEach((input, index) =>
      this.nodeList[index].value = input)
  }

  get inputs(): Array<number> {
    return this.nodeList
      .slice(...this.ranges.input)
      .map(({ value }) => value)
  }

  get outputs(): Array<number> {
    return this.nodeList
      .slice(...this.ranges.output)
      .map(({ value }) => value)
  }

  activate(node, nodeValues){
    let inputs = Object.keys(node.from)
      .reduce((sum, from) => (
        sum + nodeValues[from] * node.from[from]
      ), 0)
    node.value = activations[node.activation](inputs)
  }
  tick(){
    // const STRICT_TICKS = true
    // copy node values so that activations are simultaneous
    // sidenote: a nodes x nodes matrix of connection weights could represent the whole network
    //           I'm not sure what kind of performance boost that would yield

    let nodeValues = this.nodeList.map(node => node.value)
    for (let node of this.nodeList){
      if (node.activation){
        this.activate(node, nodeValues)
      }
    }
  }
  forward(inputs, count = 10): Array<number> {
    this.setInputs(inputs)
    while(count--){
      this.tick()
    }
    return this.outputs
  }
}


export default class GeneExpresser {
  context: InnovationContext;
  readonly packer: NodeListPacker;

  constructor(context: InnovationContext){
    this.context = context
    let inputs = this.context.getNodesOfType('INPUT').sort()
    let bias = this.context.getNodesOfType('BIAS')
    let outputs = this.context.getNodesOfType('OUTPUT').sort()
    this.packer = new NodeListPacker({ inputs, bias, outputs, outputActivation: 'sigmoid' })
  }

  nodeActivations(){
    let { nodes, activations } = this.context
    return Object.keys(nodes)
      .reduce((nodeAct, n) => (nodeAct[n] = activations[nodes[n]], nodeAct), {})
  }

  express(genome: Genome){
    return new SimpleNetwork(
      genome,
      this.packer.fromConnections(
        values(genome).filter(c => c.active),
        this.nodeActivations()
      ),
      this.packer.ranges
    )
  }

}

