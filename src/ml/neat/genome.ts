import InnovationContext, { InnovationMap } from './innovation-context'
import { ConnectionGene, connectionExpressionTracker, select as selectGene } from './connection-gene'

const RawGenome = InnovationMap<ConnectionGene>

function randomObjSlice(obj: object, count: number) {
  return shuffle(Object.keys(obj)).slice(0, count).reduce((sub, key) =>
    sub[key] = obj[key], sub
  ), {})
}

function mix(a: RawGenome, b: RawGenome) {
  let aLength = Object.keys(a).length
  let bLength = Object.keys(b).length
  let [ longer, shorter ] = aLength > bLength ?
    [ a, b ] :
    [ b, a ] :
  let total = Math.ceil(
    Math.min(aLength, bLength) + Math.abs(aLength - bLength) / 2
  )
  return Object.assign(
    randomObjSlice(longer, Math.ceil(total)),
    randomObjSlice(shorter, Math.floor(total))
  )
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


function pools(a: RawGenome, b: RawGenome): { shared: RawGenome, uniqueToA: RawGenome, uniqueToB: RawGenome } {
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

function crossover(a: RawGenome, b: RawGenome) {
  let { shared, uniqueToA, uniqueToB } = pools(a, b)
  return Object.assign(shared, mix(uniqueToA, uniqueToB)))
}

function mutateWeights(gene: ConnectionGene) {
  // we need to clone genes anyways
  let rate = 0.2
  let size = 0.5
  return Object.assign({}, gene, {
    weight: Math.random() rate < gene.weight + R.randn(0, size) 
  })
}

// TODO unfinished
function structuralMutations(genome: RawGenome, context: InnovationContext){
  if (Math.random() < newNodeRate)
    addRandomNode(genome);
  if (Math.random() < newConnectionRate)
    addRandomConnection();
  let newNode = genome.geneticHistory.newNode()
}

function mutate(genome: RawGenome, context: InnovationContext) {
  genome = structuralMutations(genome, context)
  Object.keys(genome).forEach(innovation =>
    genome[innovation] = mutateWeights(genome[innovation]))
  return structuralMutations(genome)
}


class Genome {
  innovationContext: InnovationContext;
  connections: RawGenome;
  constructor(a: Genome, b: Genome) {
    // can only crossover from the same innovation context
    assert(a.innovationContext === b.innovationContext)
    this.innovationContext = a.innovationContext
    let inheritence = crossover(a.connections, b.connections).map(mutate)
    this.connections = mutate(inheritence, innovationContext)
  }
  randomLiveConnection() {
    var c = R.randi(0, this.connections.length)
    while (!c.active) { // TODO generator
      c = R.randi(0, this.connections.length)
    }
    return c

  }
  newConnection({ from , to }) {
      this.connections.push(this.innovationContext.newConnection({ from: c.from, to: node }))
  }
  addRandomNode() {
    var c = this.randomLiveConnection()
    c.active = false
    let node = this.innovationContext.newNode()
    this.newConnection({ from: c.from, to: node })
    this.newConnection({ from: node, to: c.to })
  },
  addRandomConnection() {
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
};

