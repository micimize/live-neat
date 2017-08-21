import GeneticHistory from './genetic-history'

function mixPools(left, right) {
  let [ longer, shorter ] = left.length > right.length ?
    [ left, right ] :
    [ right, left ] :
  let total = Math.ceil(
    shorter.length + (longer.length - shorter.length) / 2
  )
  return [
    ...shuffle(longer).slice(0, Math.ceil(total)),
    ...shuffle(shorter).slice(0, Math.floor(total))
  ]
}

function connectionTracker(){
  let seen = (connection) => {
    let sig = [ connection.from, connection.to ].sort().join(',')
    if (seen.connections[sig]){
      return seen.connections[sig]
    } else {
      seen.connections[sig] = connection
      return false
    }
  }
  seen.connections = {}
  return seen
}

function arbitrary(a, b){
  return Math.random() > 0.50 ? a : b
}

function weightedLeft(a, b){
  return Math.random() > 0.75 ? a : b
}

function selectGene(a, b){
  if (!a.active){
    if (!b.active){
      return arbitrary(a, b)
    } else {
      return weightedLeft(a, b)
    }
  } else { // if (a.active) {
    if (!b.active){
      return weightedLeft(b, a)
    } else {
      return arbitrary(a, b)
    }
  }
}


function pools(a, b){
  // collects all genes that share innovation number or connection signature in shared
  let shared = {}
  let seen = connectionTracker()
  // First collect all shared innovations
  Object.keys(a).forEach(innovation => {
    seen(innovation)
    if(b[innovation]){
      shared[innovation] = selectGene(a[innovation], b[innovation])
      delete a[innovation]
      delete b[innovation]
    }
  })
  // Then collect all structurally identical connections
  // A genome can't repeat the same connection, so only one pass is neede:w
  Object.keys(b).forEach(innovation => {
    let previouslySeen = seen(b[innovation])
    if (previouslySeen){
      if (a[previouslySeen.innovation]){
        // structural sharing
        shared[innovation] = selectGene(previouslySeen, b[innovation])
      }
      delete a[previouslySeen.innovation]
      delete b[innovation]
    }
  })
  return { shared, uniqueToA: a,  uniqueToB: b }
}

function mutateWeights(gene) {
  // we need to clone genes anyways
  let rate = 0.2
  let size = 0.5
  return Object.assign({}, gene, {
    weight: Math.random() rate < gene.weight + R.randn(0, size) 
  })
}

// TODO unfinished
function structuralMutations(genome){
  if (Math.random() < newNodeRate)
    addRandomNode(genome);
  if (Math.random() < newConnectionRate)
    addRandomConnection();
  let newNode = genome.geneticHistory.newNode()
}

function crossover(a, b) {
  let { shared, uniqueToA, uniqueToB } = pools(Array.from(a), Array.from(b))
  shared.append(mixPools(uniqueToA, uniqueToB))
  return structuralMutations(shared.map(mutateWeights))
}

class Genome {
  constructor(a, b) {
    crossover(a, b).map(mutate)
    var i, j;
    var n;
    var c; // connection storage.
    this.connections = [];
    // create or copy initial connections
    
    if (initGenome && typeof initGenome.connections !== null) {
      for (i=0, i<initGenome.connections.length; i++) {
        this.connections.push(R.copy(initGenome.connections[i]));
      }
    } else {
      if (initConfig === "all") {
        // copy over initial connections (nInput + connectBias) * nOutput
        for (i=0,n=(nInput+1)*nOutput;i<n;i++) {
          c = R.zeros(3); // innovation number, weight, enabled (1)
          c[IDX_CONNECTION] = i;
          c[IDX_WEIGHT] = R.randn(initMu, initStdev);
          c[IDX_ACTIVE] = 1;
          this.connections.push(c);
        }
      }  else if (initConfig === "one") {

        for (i=0,n=(nInput+1)+nOutput;i<n;i++) {
          c = R.zeros(3); // innovation number, weight, enabled (1)
          c[IDX_CONNECTION] = i;
          // the below line assigns 1 to initial weights from dummy node to output
          c[IDX_WEIGHT] = (i < (nInput+1)) ? R.randn(initMu, initStdev) : 1.0;
          //c[IDX_WEIGHT] = R.randn(initMu, initStdev);
          c[IDX_ACTIVE] = 1;
          this.connections.push(c);
        }

      }
    }
  }
  copy() {
    var result = new Genome(this);
    if (this.fitness) result.fitness = this.fitness;
    if (this.cluster) result.cluster = this.cluster;
    return result;
  },
  addRandomNode: function() {
    // adds a new random node and assigns it a random activation gate
    // if there are no connections, don't add a new node
    if (this.connections.length === 0) return;
    var c = R.randi(0, this.connections.length); // choose random connection
    // only proceed if the connection is actually active.
    if (this.connections[c][IDX_ACTIVE] !== 1) return;

    var w = this.connections[c][1];

    this.connections[c][IDX_ACTIVE] = 0; // disable the connection
    var nodeIndex = nodes.length;
    nodes.push(getRandomActivation()); // create the new node globally

    var innovationNum = this.connections[c][0];
    var fromNodeIndex = connections[innovationNum][0];
    var toNodeIndex = connections[innovationNum][1];

    var connectionIndex = connections.length;
    // make 2 new connection globally
    connections.push([fromNodeIndex, nodeIndex]);
    connections.push([nodeIndex, toNodeIndex]);

    // put in this node locally into genome
    var c1 = R.zeros(3);
    c1[IDX_CONNECTION] = connectionIndex;
    c1[IDX_WEIGHT] = 1.0; // use 1.0 as first connection weight
    c1[IDX_ACTIVE] = 1;
    var c2 = R.zeros(3);
    c2[IDX_CONNECTION] = connectionIndex+1;
    c2[IDX_WEIGHT] = w; // use old weight for 2nd connection
    c2[IDX_ACTIVE] = 1;

    this.connections.push(c1);
    this.connections.push(c2);
  },
  getNodesInUse: function() {
    var i, n, connectionIndex, nodeIndex;
    var nodesInUseFlag = R.zeros(nodes.length);
    var nodesInUse = [];
    var len = nodes.length;

    for (i=0,n=this.connections.length;i<n;i++) {
      connectionIndex = this.connections[i][0];
      nodeIndex = connections[connectionIndex][0];
      nodesInUseFlag[nodeIndex] = 1;
      nodeIndex = connections[connectionIndex][1];
      nodesInUseFlag[nodeIndex] = 1;
    }
    for (i=0,n=len;i<n;i++) {
      if (nodesInUseFlag[i] === 1 || (i < nInput+1+nOutput) ) { // if node is input, bias, output, throw it in too
        //console.log('pushing node #'+i+' as node in use');
        nodesInUse.push(i);
      }
    }
    return nodesInUse;
  },
  addRandomConnection: function() {
    // attempts to add a random connection.
    // if connection exists, then does nothing (ah well)

    var i, n, connectionIndex, nodeIndex;

    var nodesInUse = this.getNodesInUse();
    var len = nodes.length;

    //var fromNodeIndex = R.randi(0, nodes.length);
    //var toNodeIndex = R.randi(outputIndex, nodes.length); // includes bias.

    var slack = 0;
    var r1 = R.randi(0, nodesInUse.length - nOutput);
    if (r1 > nInput+1) slack = nOutput; // skip the outputs of the array.
    var fromNodeIndex = nodesInUse[r1 + slack]; // choose anything but output nodes
    var toNodeIndex = nodesInUse[R.randi(outputIndex, nodesInUse.length)]; // from output to other nodes

    var fromNodeUsed = false;
    var toNodeUsed = false;

    if (fromNodeIndex === toNodeIndex) {
      //console.log('addRandomConnection failed to connect '+fromNodeIndex+' to '+toNodeIndex);
      return; // can't be the same index.
    }

    // cannot loop back out from the output.
    /*
      if (fromNodeIndex >= outputIndex && fromNodeIndex < (outputIndex+nOutput)){
        //console.log('addRandomConnection failed to connect '+fromNodeIndex+' to '+toNodeIndex);
        return;
      }
      */

        // the below set of code will test if selected nodes are actually used in network connections
        for (i=0,n=this.connections.length;i<n;i++) {
          connectionIndex = this.connections[i][0];
          if ((connections[connectionIndex][0] === fromNodeIndex) || (connections[connectionIndex][1] === fromNodeIndex)) {
            fromNodeUsed = true; break;
          }
        }
    for (i=0,n=this.connections.length;i<n;i++) {
      connectionIndex = this.connections[i][0];
      if ((connections[connectionIndex][0] === toNodeIndex) || (connections[connectionIndex][1] === toNodeIndex)) {
        toNodeUsed = true; break;
      }
    }

    if (fromNodeIndex < nInput+1) fromNodeUsed = true; // input or bias
    if ((toNodeIndex >= outputIndex) && (toNodeIndex < outputIndex+nOutput)) toNodeUsed = true; // output

    if (!fromNodeUsed || !toNodeUsed) {
      if (debug_mode) {
        console.log('nodesInUse.length = '+nodesInUse.length);
        console.log('addRandomConnection failed to connect '+fromNodeIndex+' to '+toNodeIndex);
      }
      return; // only consider connections in current net.
    }
    //console.log('attempting to connect '+fromNodeIndex+' to '+toNodeIndex);

    var searchIndex = -1; // see if connection already exist.
    for (i=0,n=connections.length;i<n;i++) {
      if (connections[i][0] === fromNodeIndex && connections[i][1] === toNodeIndex) {
        searchIndex = i; break;
      }
    }

    if (searchIndex < 0) {
      // great, this connection doesn't exist yet!
      connectionIndex = connections.length;
      connections.push([fromNodeIndex, toNodeIndex]);

      var c = R.zeros(3); // innovation number, weight, enabled (1)
      c[IDX_CONNECTION] = connectionIndex;
      c[IDX_WEIGHT] = R.randn(initMu, initStdev);
      c[IDX_ACTIVE] = 1;
      this.connections.push(c);
    } else {
      var connectionIsInGenome = false;
      for (i=0,n=this.connections.length; i<n; i++) {
        if (this.connections[i][IDX_CONNECTION] === searchIndex) {
          // enable back the index (if not enabled)
          if (this.connections[i][IDX_ACTIVE] === 0) {
            this.connections[i][IDX_WEIGHT] = R.randn(initMu, initStdev); // assign a random weight to reactivated connections
            this.connections[i][IDX_ACTIVE] = 1;
          }
          connectionIsInGenome = true;
          break;
        }
      }
      if (!connectionIsInGenome) {
        // even though connection exists globally, it isn't in this gene.
        //console.log('even though connection exists globally, it isnt in this gene.');
        var c1 = R.zeros(3); // innovation number, weight, enabled (1)
        c1[IDX_CONNECTION] = searchIndex;
        c1[IDX_WEIGHT] = R.randn(initMu, initStdev);
        c1[IDX_ACTIVE] = 1;
        this.connections.push(c1);

        //console.log('added connection that exists somewhere else but not here.');
      }
    }

  },
  createUnrolledConnections: function() {
    // create a large array that is the size of Genome.connections
    // element:
    // 0: 1 or 0, whether this connection exists in this genome or not
    // 1: weight
    // 2: active? (1 or 0)
    var i, n, m, cIndex, c;
    this.unrolledConnections = [];
    n=connections.length; // global connection length
    m=this.connections.length;
    for (i=0;i<n;i++) {
      this.unrolledConnections.push(R.zeros(3));
    }
    for (i=0;i<m;i++) {
      c = this.connections[i];
      cIndex = c[IDX_CONNECTION];
      this.unrolledConnections[cIndex][IDX_CONNECTION] = 1;
      this.unrolledConnections[cIndex][IDX_WEIGHT] = c[IDX_WEIGHT];
      this.unrolledConnections[cIndex][IDX_ACTIVE] = c[IDX_ACTIVE];
    }
  },
  crossover: function(that) { // input is another genome
    // returns a newly create genome that is the offspring.
    var i, n, c;
    var child = new Genome();
    child.connections = []; // empty initial connections
    var g;
    var count;

    n = connections.length;

    this.createUnrolledConnections();
    that.createUnrolledConnections();

    for (i=0;i<n;i++) {
      count = 0;
      g = this;
      if (this.unrolledConnections[i][IDX_CONNECTION] === 1) {
        count++;
      }
      if (that.unrolledConnections[i][IDX_CONNECTION] === 1) {
        g = that;
        count++;
      }
      if (count === 2 && Math.random() < 0.5) {
        g = this;
      }
      if (count === 0) continue; // both genome doesn't contain this connection
      c = R.zeros(3);
      c[IDX_CONNECTION] = i;
      c[IDX_WEIGHT] = g.unrolledConnections[i][IDX_WEIGHT];
      // in the following line, the connection is disabled only of it is disabled on both parents
      c[IDX_ACTIVE] = 1;
      if (this.unrolledConnections[i][IDX_ACTIVE] === 0 && that.unrolledConnections[i][IDX_ACTIVE] === 0) {
        c[IDX_ACTIVE] = 0;
      }
      child.connections.push(c);
    }

    return child;
  },
  setupModel: function(inputDepth) {
    // setup recurrent.js model
    var i;
    var nNodes = nodes.length;
    var nConnections = connections.length;
    this.createUnrolledConnections();
    this.model = [];
    var nodeModel = [];
    var connectionModel = [];
    var c;
    for (i=0;i<nNodes;i++) {
      nodeModel.push(new R.Mat(inputDepth, 1));
    }
    for (i=0;i<nConnections;i++) {
      c = new R.Mat(1, 1);
      c.w[0] = this.unrolledConnections[i][IDX_WEIGHT];
      connectionModel.push(c);
    }
    this.model.nodes = nodeModel;
    this.model.connections = connectionModel;
  },
  updateModelWeights: function() {
    // assume setupModel is already run. updates internal weights
    // after backprop is performed
    var i, n, m, cIndex;
    var nConnections = connections.length;

    var connectionModel = this.model.connections;
    var c;

    for (i=0;i<nConnections;i++) {
      this.unrolledConnections[i][IDX_WEIGHT] = connectionModel[i].w[0];
    }

    m=this.connections.length;
    for (i=0;i<m;i++) {
      c = this.connections[i];
      cIndex = c[IDX_CONNECTION];
      if (c[IDX_ACTIVE]) {
        c[IDX_WEIGHT] = this.unrolledConnections[cIndex][IDX_WEIGHT];
      }
    }
  },
  zeroOutNodes: function() {
    R.zeroOutModel(this.model.nodes);
  },
  setInput: function(input) {
    // input is an n x d R.mat, where n is the inputDepth, and d is number of inputs
    // for generative art, d is typically just (x, y)
    // also sets all the biases to be 1.0
    // run this function _after_ setupModel() is called!
    var i, j;
    var n = input.n;
    var d = input.d;
    var inputNodeList = getNodeList(NODE_INPUT);
    var biasNodeList = getNodeList(NODE_BIAS);
    var dBias = biasNodeList.length;

    R.assert(inputNodeList.length === d, 'inputNodeList is not the same as dimentions');
    R.assert(this.model.nodes[0].n === n, 'model nodes is not the same as dimentions');

    for (i=0;i<n;i++) {
      for (j=0;j<d;j++) {
        this.model.nodes[inputNodeList[j]].set(i, 0, input.get(i, j));
      }
      for (j=0;j<dBias;j++) {
        this.model.nodes[biasNodeList[j]].set(i, 0, 1.0);
      }
    }
  },
  getOutput: function() {
    // returns an array of recurrent.js Mat's representing the output
    var i;
    var outputNodeList = getNodeList(NODE_OUTPUT);
    var d = outputNodeList.length;
    var output = [];
    for (i=0;i<d;i++) {
      output.push(this.model.nodes[outputNodeList[i]]);
    }
    return output;
  },
  roundWeights: function() {
    var precision = 10000;
    for (var i=0;i<this.connections.length;i++) {
      this.connections[i][IDX_WEIGHT] = Math.round(this.connections[i][IDX_WEIGHT]*precision)/precision;
    }
  },
  toJSON: function(description) {

    var data = {
      nodes: copyArray(nodes),
      connections: copyConnections(connections),
      nInput: nInput,
      nOutput: nOutput,
      renderMode: renderMode,
      outputIndex: outputIndex,
      genome: this.connections,
      description: description
    };

    this.backup = new Genome(this);

    return JSON.stringify(data);

  },
  fromJSON: function(data_string) {
    var data = JSON.parse(data_string);
    nodes = copyArray(data.nodes);
    connections = copyConnections(data.connections);
    nInput = data.nInput;
    nOutput = data.nOutput;
    renderMode = data.renderMode || 0; // might not exist.
    outputIndex = data.outputIndex;
    this.importConnections(data.genome);

    return data.description;
  },
  forward: function(G) {
    // forward props the network from input to output.  this is where magic happens.
    // input G is a recurrent.js graph
    var outputNodeList = getNodeList(NODE_OUTPUT);
    var biasNodeList = getNodeList(NODE_BIAS);
    var inputNodeList = biasNodeList.concat(getNodeList(NODE_INPUT));

    var i, j, n;
    var nNodes = nodes.length;
    var nConnections = connections.length;
    var touched = R.zeros(nNodes);
    var prevTouched = R.zeros(nNodes);
    var nodeConnections = new Array(nNodes); // array of array of connections.

    var nodeList = [];
    var binaryNodeList = R.zeros(nNodes);

    for (i=0;i<nNodes;i++) {
      nodeConnections[i] = []; // empty array.
    }

    for (i=0;i<nConnections;i++) {
      if (this.unrolledConnections[i][IDX_ACTIVE] && this.unrolledConnections[i][IDX_CONNECTION]) {
        nodeConnections[connections[i][1]].push(i); // push index of connection to output node
        binaryNodeList[connections[i][0]] = 1;
        binaryNodeList[connections[i][1]] = 1;
      }
    }

    for (i=0;i<nNodes;i++) {
      if (binaryNodeList[i] === 1) {
        nodeList.push(i);
      }
    }

    for (i=0,n=inputNodeList.length;i<n;i++) {
      touched[inputNodeList[i]] = 1.0;
    }

    function allTouched(listOfNodes) {
      for (var i=0,n=listOfNodes.length;i<n;i++) {
        if (touched[listOfNodes[i]] !== 1) {
          return false;
        }
      }
      return true;
    }

    function noProgress(listOfNodes) {
      var idx;
      for (var i=0,n=listOfNodes.length;i<n;i++) {
        idx = listOfNodes[i];
        if (touched[idx] !== prevTouched[idx]) {
          return false;
        }
      }
      return true;
    }

    function copyTouched(listOfNodes) {
      var idx;
      for (var i=0,n=listOfNodes.length;i<n;i++) {
        idx = listOfNodes[i];
        prevTouched[idx] = touched[idx];
      }
    }

    function forwardTouch() {
      var i, j;
      var n=nNodes, m, ix; // ix is the index of the global connections.
      var theNode;

      for (i=0;i<n;i++) {
        if (touched[i] === 0) {
          theNode = nodeConnections[i];
          for (j=0,m=theNode.length;j<m;j++) {
            ix = theNode[j];
            if (touched[connections[ix][0]] === 1) {
              //console.log('node '+connections[ix][0]+' is touched, so now node '+i+' has been touched');
              touched[i] = 2; // temp touch state
              break;
            }
          }
        }
      }

      for (i=0;i<n;i++) {
        if (touched[i] === 2) touched[i] = 1;
      }

    }

    // forward tick magic
    function forwardTick(model) {
      var i, j;
      var n, m, cIndex, nIndex; // ix is the index of the global connections.
      var theNode;

      var currNode, currOperand, currConnection; // recurrent js objects
      var needOperation; // don't need operation if node is operator(node) is null or mul or add
      var nodeType;
      var finOp; // operator after all operands are weighted summed or multiplied
      var op; // either 'add' or 'eltmult'
      var out; // temp variable for storing recurrentjs state
      var cumulate; // cumulate all the outs (either addition or mult)

      n=nNodes;
      for (i=0;i<n;i++) {
        if (touched[i] === 1) { // operate on this node since it has been touched

          theNode = nodeConnections[i];
          m=theNode.length;
          // if there are no operands for this node, then don't do anything.
          if (m === 0) continue;

          nodeType = nodes[i];
          needOperation = true;
          finOp = operators[nodeType];
          if (finOp === null || finOp === 'mult' || finOp === 'add' || nodeType === NODE_MGAUSSIAN) needOperation = false;

          // usually we add weighted sum of operands, except if operator is mult
          op = 'add';
          if (finOp === 'mult') op = 'eltmul';

          // cumulate all the operands
          for (j=0;j<m;j++) {
            cIndex = theNode[j];
            nIndex = connections[cIndex][0];
            currConnection = model.connections[cIndex];
            currOperand = model.nodes[nIndex];
            out = G.mul(currOperand, currConnection);
            if (nodeType === NODE_MGAUSSIAN) { // special case:  the nasty multi gaussian
              out = G.gaussian(out);
            }
            if (j === 0) { // assign first result to cumulate
              cumulate = out;
            } else { // cumulate next result after first operand
              cumulate = G[op](cumulate, out); // op is either add or eltmul
            }
          }

          // set the recurrentjs node here
          model.nodes[i] = cumulate;
          // operate on cumulated sum or product if needed
          if (needOperation) {
            model.nodes[i] = G[finOp](model.nodes[i]);
          }

          // another special case, squaring the output
          if (nodeType === NODE_SQUARE) {
            model.nodes[i] = G.eltmul(model.nodes[i], model.nodes[i]);
          }

        }
      }


    }

    function printTouched() {
      var i;
      var result="";
      for (i=0;i<touched.length;i++) {
        result += touched[i]+" ";
      }
      console.log(result);
    }

    //printTouched();
    for (i=0;i<MAX_TICK;i++) {
      forwardTouch();
      forwardTick(this.model); // forward tick the network using graph
      //printTouched();
      /*
        if (allTouched(outputNodeList)) {
          //console.log('all outputs touched!');
          //break;
        }
        */
          if (allTouched(nodeList)) {
            //console.log('all nodes touched!');
            break;
          }
      if (noProgress(nodeList)) { // the forward tick made no difference, stuck
        //console.log('all nodes touched!');
        break;
      }
      copyTouched(nodeList);
    }

  }

};

