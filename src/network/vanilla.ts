import InnovationContext from '../innovation-context'
import Genome from '../genome'
import NodeListPacker from './node-list-packer'

const activations = {
  sigmoid(t: number) {
    return 1.0 / ( 1.0 + Math.exp( -t ))
  }
}

function serializeNode({ activation, from = {} }: Node) {
  let connections = Object.keys(from).map(k => `${k}*${from[k]}`)
  return `${activation}:${connections.join(',')}` 
}

class SimpleNetwork implements Network {
  constructor(
    public nodeList: Array<Node>,
    public ranges,
    public genome: Genome,
  ){ }

  setInputs(inputs: Array<Value>): void {
    // range is [ first, last ] indices
    //assert (inputs.length - 1 == this.ranges.input[1])
    inputs.forEach((input, index) =>
      this.nodeList[index].value = input)
  }

  get inputs(): Array<Value> {
    return this.nodeList
      .slice(...this.ranges.input)
      .map(({ value }) => value)
  }

  get outputs(): Array<Value> {
    return this.nodeList
      .slice(...this.ranges.output)
      .map(({ value }) => value)
  }

  get complete(): boolean {
    return Boolean(this.outputs.filter(output => output != null).length)
  }

  clear(): void {
    // TODO I'M A SINNER
    this.nodeList.forEach(node => {
      if(node.activation !== 'static') {
        node.value = null
      }
    })
  }

  activate(node, nodeValues){
    let inputs = Object.keys(node.from)
      .filter(from => nodeValues[from] !== null)
      .map(from => nodeValues[from] * node.from[from])
    if (inputs.length) {
      node.value = activations[node.activation](
        inputs.reduce((sum, input) => sum + input))
    }
  }

  tick(){
    // const STRICT_TICKS = true
    // copy node values so that activations are simultaneous
    // sidenote: a nodes x nodes matrix of connection weights could represent the whole network
    //           I'm not sure what kind of performance boost that would yield

    let nodeValues = this.nodeList.map(node => node.value)
    for (let node of this.nodeList){
      if (!['static', 'input'].includes(node.activation) && node.from){
        this.activate(node, nodeValues)
      }
    }
  }
    
  forward(inputs, count = 10): Array<Value> {
    this.setInputs(inputs)
    while(!this.complete && count--){
      this.tick()
    }
    if(!count){
      throw Error('DISCONNECTED!!??!?!???!!!?!?')
    }
    return this.outputs
  }

  toJSON() {
    let { input: [ _, inputs ], output: [ outputStart, outputEnd ]} = this.ranges
    let outputs: Number = outputEnd - outputStart
    return `${inputs}i${outputs}ob/${this.nodeList.slice(outputStart).map(serializeNode).join(';')}`
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
    let { hiddenNodes: nodes, activations } = this.context
    return Object.keys(nodes)
      .reduce((nodeAct, n) => (nodeAct[n] = activations[nodes[n]], nodeAct), {})
  }

  express(genome: Genome){
    return new SimpleNetwork(
      genome,
      this.packer.fromConnections(
        Object.values(genome).filter(c => c.active),
        this.nodeActivations()
      ),
      this.packer.ranges
    )
  }

}

function deserializeProperties(properties: string)  {
  let [ inputs, outputs, , bias = false ] = properties.split(/i|o|b/g)
  return {
    bias: bias ? 1 : 0,
    inputs: Number(inputs),
    outputs: Number(outputs),
  }
}

function deserializeNode(node: string)  {
  let [ activation, ...connections ] = node.split(/:|,/)
  let from = connections.reduce((m, c) => {
    let [ source, weight ] = c.split('*')
    m[source] = Number(weight)
    return m
  }, {})
  return { activation, from, value: 0 }
}

function fillNodes(count: number, activation: string, value: number = 0): Array<{ activation, value }>{
  return Array(count)
    .fill(null)
    .map((_) => ({ activation, value }))
}

export function deserialize(network: string): SimpleNetwork {
  let [ properties, nodes ] = network.split('/')
  let { inputs, outputs, bias } = deserializeProperties(properties)
  let nodeList = [
    ...fillNodes(inputs, 'input'),
    ...fillNodes(bias, 'static', 1),
    ...fillNodes(outputs, 'sigmoid', 0),
    ...nodes.split(';').map(deserializeNode)
  ].map((n, id) => ({ id, ...n }))
}
