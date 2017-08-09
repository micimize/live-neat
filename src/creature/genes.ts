import * as N from '../ml/neat.js'
import { INPUT_VECTOR_SIZE, OUTPUT_VECTOR_SIZE } from './network'

N.init({
  nInput: INPUT_VECTOR_SIZE,
  nOutput: OUTPUT_VECTOR_SIZE,
  initConfig: 'all',            // initially, each input is connected to each output when "all" is used
  activations : 'default',      // [SIGMOID, TANH, RELU, GAUSSIAN, SIN, ABS, MULT, SQUARE, ADD] for "default"
});

export default function trainer() {

  // setup NEAT universe:
  // setup NEAT trainer with the hyper parameters for GA.
  let trainer: any = new N.NEATTrainer({
    new_node_rate : 0.1, // probability of a new node created for each genome during each evolution cycle
    new_connection_rate : 0.5, // probability of a new connection created for each genome during each evolution cycle, if it can be created
    num_populations: 3, // cluster the population into 5 sub populations that are similar using k-medoids
    sub_population_size : 10, // each sub population has 20 members, so 100 genomes in total
    init_weight_magnitude : 0.25, // randomise initial weights to be gaussians with zero mean, and this stdev.
    mutation_rate : 0.9, // probability of mutation for weights (for this example i made it large)
    mutation_size : 0.005, // if weights are mutated, how much we mutate them by in stdev? (I made it very small for this example)
    extinction_rate : 0.5, // probably that the worst performing sub population goes extinct at each evolution cycle
  }); // the initial population of genomes is randomly created after N.NEATTrainer constructor is called.

  trainer.getNumGeneration = N.getNumGeneration
  return trainer
}

