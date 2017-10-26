import { InnovationChronicle, getNodesOfType, hiddenNodeActivations } from '../innovation'
import { Genome } from '../genome'
import { Network } from './network'

type AndGenome = { genome: Genome }
type Chronicle = { chronicle: InnovationChronicle }

import NodeListPacker from './node-list-packer'

const activations = {
  sigmoid(t: number) {
    return 1.0 / ( 1.0 + Math.exp( -t ))
  }
}

function serializeNode({ activation, from = {} }: Network.Node) {
  let connections = Object.keys(from).map(k => `${k}*${from[k]}`)
  return `${activation}:${connections.join(',')}` 
}

function isToNode(node: Network.Node): node is Network.ToNode {
  return node.hasOwnProperty('from')
}

class SimpleNetwork implements Network {
  constructor(
    public nodeList: Array<Network.Node>,
    public ranges,
    public genome: Genome,
  ){ }

  setInputs(inputs: Array<Network.ActivationValue>): void {
    // range is [ first, last ] indices
    //assert (inputs.length - 1 == this.ranges.input[1])
    inputs.forEach((input, index) =>
      this.nodeList[index].value = input)
  }

  get inputs(): Array<Network.ActivationValue> {
    return this.nodeList
      .slice(...this.ranges.input)
      .map(({ value }) => value)
  }

  get outputs(): Array<Network.ActivationValue> {
    return this.nodeList
      .slice(...this.ranges.output)
      .map(({ value }) => value)
  }

  get mutable(): Array<Network.Node> {
    // we know the packer packs [...inputs, ...biases, ...outputs, so slice starting at outputs]
    return this.nodeList
      .slice(this.ranges.output[0])
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

  activate(node: Network.ToNode, nodeActivationValues): void {
    let inputs = Object.keys(node.from)
      .filter(from => nodeActivationValues[from] !== null)
      .map(from => nodeActivationValues[from] * node.from[from])
    if (inputs.length) {
      try {
        node.value = activations[node.activation](
          inputs.reduce((sum, input) => sum + input)
        )
      } catch (e){
        console.log(`cannot activate ${JSON.stringify(node)} with inputs ${inputs}`)
        throw e
      }
    }
  }

  tick(){
    // const STRICT_TICKS = true
    // copy node values so that activations are simultaneous
    // sidenote: a nodes x nodes matrix of connection weights could represent the whole network
    //           I'm not sure what kind of performance boost that would yield

    let nodeActivationValues = this.nodeList.map(node => node.value)
    for (let node of this.mutable){
      if (isToNode(node)){
        this.activate(node, nodeActivationValues)
      }
    }
  }
    
  forward(inputs, count = 10): Array<Network.ActivationValue> {
    this.setInputs(inputs)
    while(!this.complete && (count-- > 0)){
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

function Packer({ chronicle }: Chronicle){
  let inputs = getNodesOfType(chronicle, 'INPUT').sort()
  let bias = getNodesOfType(chronicle, 'BIAS')
  let outputs = getNodesOfType(chronicle, 'OUTPUT').sort()
  return new NodeListPacker({ inputs, bias, outputs, outputActivation: 'sigmoid' })
}

interface Express {
  (args: Chronicle & AndGenome, packer?: NodeListPacker): SimpleNetwork,
  packer: NodeListPacker
}

function GeneExpresser(args: Chronicle): Express {
  let express = <Express> function (
    { chronicle, genome }: Chronicle & AndGenome,
    packer: NodeListPacker = express.packer
  ){
    return new SimpleNetwork(
      packer.fromConnections(
        Array.from(genome.connections.values()).filter(c => c.active),
        hiddenNodeActivations(chronicle)
      ),
      packer.ranges,
      genome
    )
  }
  express.packer = Packer(args)
  return express
}

export { GeneExpresser, Express, SimpleNetwork }