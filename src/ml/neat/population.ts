
class Population {
  species: Set<Species>;
  constructor(desiredSpecies: number, genomes: Set<Genome>) {
    this.species = new Set()
    for (let genome of genomes){
      this.add(genome)
    }
  }
  delete(genome: Genome) {
    for (let species of this.species) {
      if(species.has(genome)) {
        return species.delete(genome)
      }
    }
    return false
  }
  add(genome: Genome) {
    let speciated = false
    for (let species of this.species){
      speciated = species.add(genome)
      if (speciated){
        break
      }
    }
    if (!speciated){
      this.species.add(new Species(genome))
    }
  }
}

function seedPopulation(innovationContext, size: number, speciesCount: number){
  return Population(speciesCount, seedGenome(InnovationContext, size))

}
