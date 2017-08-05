import * as R from './recurrent.js'
import * as N from './neat.js'

// settings
var penaltyConnectionFactor = 0.03;
var learnRate = 0.01;

// globals
var trainer; // NEAT trainer object to be initalised later from initModel()
var genome; // keep one genome around for good use.
var solver = new R.Solver(); // the Solver uses RMSProp

function genomeToNetwork(genome) {
  genome.setupModel(size); // setup the model so recurrent.js can use it. Size is the input vector size
  var G = new R.Graph(false); // setup the recurrent.js graph. if no backprop, faster.
  genome.setInput(data); // put the input data into the network
  genome.forward(G); // propagates the network forward.
  var output = genome.getOutput(); // get the output from the network
  output[0] = G.sigmoid(output[0]); // in addition, take the sigmoid of the output, so output is in [0, 1]
}

function fitnessFunc(genomes, backpropMode = false, _nCycles = 1) {
  /*
  an example of a fitness function for NEAT for a given genome.
  this function is called inside the NEATTrainer as well for performing GA on its population
  it can handle backprop if 2nd and 3rd params are used.
  if used, this function backprops the genome over nCycles on the dataset.
  the function returns final fitness, which is based on the data fitting error
  the more negative the fitness, the crappier the given genome
  */

  var nTrainSize = genomes.length
  var trainData = DataSet.getTrainData();
  var trainLabel = DataSet.getTrainLabel();
  var nBatchSize = DataSet.getBatchLength();
  var batchData;
  var batchLabel;

  var penaltyConnection = genome.connections.length;
  var penaltyFactor = 1+penaltyConnectionFactor*Math.sqrt(penaltyConnection); // punish the fitness if there are lots of nodes
  // returns the fitness based on the regression error and connection penalty.
  // a more negative fitness means the given genome is crappier.
  return -avgError*penaltyFactor;
};


var initModel = function() {
  // setup NEAT universe:
  N.init({nInput: 2, nOutput: 1, // 2 inputs (x, y) coordinate, one output (class)
    initConfig: "all", // initially, each input is connected to each output when "all" is used
    activations : "default", // [SIGMOID, TANH, RELU, GAUSSIAN, SIN, ABS, MULT, SQUARE, ADD] for "default"
  });
  // setup NEAT trainer with the hyper parameters for GA.
  trainer = new N.NEATTrainer({
    new_node_rate : 0.2, // probability of a new node created for each genome during each evolution cycle
    new_connection_rate : 0.5, // probability of a new connection created for each genome during each evolution cycle, if it can be created
    num_populations: 5, // cluster the population into 5 sub populations that are similar using k-medoids
    sub_population_size : 20, // each sub population has 20 members, so 100 genomes in total
    init_weight_magnitude : 0.25, // randomise initial weights to be gaussians with zero mean, and this stdev.
    mutation_rate : 0.9, // probability of mutation for weights (for this example i made it large)
    mutation_size : 0.005, // if weights are mutated, how much we mutate them by in stdev? (I made it very small for this example)
    extinction_rate : 0.5, // probably that the worst performing sub population goes extinct at each evolution cycle
  }); // the initial population of genomes is randomly created after N.NEATTrainer constructor is called.
  trainer.applyFitnessFunc(fitnessFunc); // this would calculate the fitness for each genome in the population, and clusters them into the 5 sub populations
};

/*
Main part of the code.
*/
initModel();
genome = trainer.getBestGenome();

for (var i = 0; i < 10; i++) { // evolve and backprop 10 times
  printPerformanceMetrics(genome); // print out the performance metrics
  trainer.evolve();
  genome = trainer.getBestGenome();
}

