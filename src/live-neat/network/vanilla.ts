import InnovationContext from '../innovation-context'
import Genome from '../genome'
import NodeListPacker from './node-list-packer'
import Network, { Node, Range } from './type'

function values(obj): any[] {
  return Object.keys(obj).map(k => obj[k])
}

const activations = {
  sigmoid(t: number) {
    return 1 / ( 1 + Math.pow( Math.E, -t ));
  }
}


class SimpleNetwork implements Network{
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

  getOutputs(): Array<number> {
    return this.nodeList
      .slice(...this.ranges.output)
      .map(({ value }) => value)
  }
  activate(node){
    let inputs = Object.keys(node.from)
      .reduce((sum, from) => (
        sum + this.nodeList[from].value * node.from[from].weight
      ), 0)
    node.value = activations[node.activation](inputs)
  }
  tick(){
    for (let node of this.nodeList){
      if (node.activation){
        this.activate(node)
      }
    }
  }
  forward(inputs, count = 10): Array<number> {
    this.setInputs(inputs)
    while(count--){
      this.tick()
    }
    return this.getOutputs()
  }
}


export default class GeneExpresser {
  context: InnovationContext;
  readonly packer: NodeListPacker;

  constructor(context: InnovationContext){
    let inputs = this.context.getNodesOfType('INPUT').sort()
    let bias = this.context.getNodesOfType('BIAS')
    let outputs = this.context.getNodesOfType('OUTPUT').sort()
    this.packer = new NodeListPacker({ inputs, bias, outputs, outputActivation: 'sigmoid' })
  }

  nodeActivations(){
    let nodes = this.context.nodes
    return Object.keys(nodes)
      .filter(n => nodes[n].activation !== undefined) 
      .reduce((activations, n) => (activations[n] = nodes[n].activation, activations), {})
  }

  express(genome: Genome){
    return new SimpleNetwork(
      genome,
      this.packer.fromConnections(values(genome), this.nodeActivations()),
      this.packer.ranges
    )
  }

}

