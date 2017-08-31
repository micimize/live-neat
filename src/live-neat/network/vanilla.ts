import InnovationContext from './innovation-context'
import Genome from './genome'

function values(obj): any[] {
  return Object.keys(obj).map(k => obj[k])
}

const activations = {
  sigmoid(t: number) {
    return 1 / ( 1 + Math.pow( Math.E, -t ));
  }
}


function packNodeList(inputs: Array<number>, bias: Array<number>, outputs: Array<number>, genome: Genome, nodeActivations: object): Array {
  let ranges = { inputs: [ 0, inputs.length - 1 ] }
  let nodeList = inputs.sort().map(() => ({ value: 0 }))
  let translator = inputs.reduce((t, i) => (t[i] = i, t), {})
  translator[bias] = nodeList.push({ value: 1 }) - 1
  let getNodeRef = (node: number) => {
    if (!translator[node]){
      // add node number to list, make accessible
      translator[node] = nodeList.push({
        value: 0,
        from: {},
      }) - 1
      if(nodeActivations[node]){
        nodeList[translator[node]].activate = activations[nodeActivations[node]]
      }
    }
    return translator[node]
  }

  // always need outputs
  ranges.outputs = [ nodeList.length, nodeList.length + outputs.length - 1 ]
  outputs.sort().forEach(getNodeRef)

  let connections = values(genome).filter(({ active }) => active)

  // add all "to" nodes
  connections.forEach(({ to }) => getNodeRef(to))

  // only add "from" to node if it is relevant
  connections.forEach(({ from, to, weight }) => {
    if (translator[from]){
      nodeList[getNodeRef(to)].from[getNodeRef(from)] = weight
    }
  })

  return { nodeList, ranges }
}

class Network {
  constructor(nodeList, ranges){
    Object.assign(this, { nodeList, ranges })
  }
  setInputs(inputs){
    // range is [ first, last ] indices
    assert(inputs.length - 1 == this.ranges.input[1])
    inputs.forEach((input, index) =>
      this.nodeList[index].value = input)
  }
  getOutputs(){
    return this.nodeList
      .slice(...this.ranges.output)
      .map(({ value }) => value)
  }
  activate(node, index){
    let inputs = Object.keys(node.from)
      .reduce((sum, from) =>
        sum + this.nodeList[from].value * node.from[from].weight
      ), 0)
    node.value = node.activate(inputs)
  }
  tick(){
    for(node in this.nodeList){
      this.activate(node)
    }
  }
  forward(inputs, count = 10){
    this.setInputs(inputs)
    while(count--){
      this.tick()
    }
    return this.getOutputs()
  }
}

class GeneExpresser {
  context: InnovationContext;

  constructor(context: InnovationContext){
  }

  nodeActivations(){
    let nodes = this.context.nodes
    return Object.keys(nodes)
      .filter(n => nodes[n].activation !== undefined) 
      .reduce((activations, n) => (activations[node] = nodes[n].activation, activations), {})
  }

  express(genome: Genome){
    let inputs = this.context.getNodesOfType('INPUT')
    let bias = this.context.getNodesOfType('BIAS')
    let outputs = this.context.getNodesOfType('OUTPUT')
    return new Network(packNodeList(inputs, bias, outputs, genome, this.nodeActivations()))
  }

}

