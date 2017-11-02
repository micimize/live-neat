import { Range } from 'immutable'
import { bounder } from '../utils'
import { InnovationChronicle, getNodesOfType, hiddenNodeActivations } from '../innovation'
import { Genome } from '../genome'
import { Network } from './network'

type AndGenome = { genome: Genome }
type Chronicle = { chronicle: InnovationChronicle }

import NodeListPacker from './node-list-packer'

let bound = bounder({ minimum: -60, maximum: 60 })
const activations = {
  sigmoid(t: number) {
    return 1.0 / ( 1.0 + Math.exp( bound(-5 * t) ))
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

  get depth(): number {
    const maxDepthFromNode = (node: number): number => {
      if(node < this.ranges.output[0]){
        // static nodes have a depth of 0
        return 0
      }
      let fromNodes = Object.keys(this.nodeList[node].from || <number>{})
        .map(n => Number(n))
      return 1 + Math.max(...fromNodes.map(maxDepthFromNode))
    }
    if (Math.max(...Range(...this.ranges.output).map(maxDepthFromNode)) < 0){
      debugger

    }
    return Math.max(...Range(...this.ranges.output).map(maxDepthFromNode))
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
    let inputSum = 0
    for (let from of Object.keys(node.from)){
      if(nodeActivationValues[from] === null){
        // Can't activate yet
        return
      }
      inputSum += nodeActivationValues[from] * node.from[from]
    }
    node.value = activations[node.activation](inputSum)
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
    
  forward(inputs, count = this.depth): Array<Network.ActivationValue> {
    /*
     *TODO 
     * It seems that in classification tasks you want to wait for the network to stabalize,
     * but in control tasks the agent is "constantly" acting.
     */
    this.setInputs(inputs)
    while(count --> 0){
      this.tick()
    }
    if(!this.complete){
      //throw Error('DISCONNECTED!!??!?!???!!!?!?')
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