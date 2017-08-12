import * as React from 'react';
import './App.css'
import generationBoard, { offline } from './game'
import trainer from './creature/genes'

function Cell({ color = [ 255, 255, 255 ], direction, action, size }: any){ //{ color: [ number, number, number ], size: string }) {
  let style = {
    backgroundColor: `rgb(${color.join(', ')})`,
    width: size,
    height: size,
  }
  return <div className={`cell ${action} ${direction}`} style={style} />
}


interface SectionProps {
}

interface SectionState {
    round: number,
    board: any,
    species: any,
    interval?: any,
    stepInterval?: number,
    offlineRounds: number,
    runningOffline?: boolean,
    stats?: any,
}

class App extends React.Component<SectionProps, SectionState> {
  constructor(props: SectionProps) {
    super(props)
    let species = trainer()
    let { board } = generationBoard(species.genes)
    this.state = {
      round: 0,
      board,
      species,
      offlineRounds: 10,
      stepInterval: 10
    }
  }

  step = async () => {
    if(this.state.board.moving){
      return
    }
    let { living, dead } = await this.state.board.turn()
    let round = this.state.round + 1
    if(!living.size){
      let species = this.state.species

      let minAge = Infinity
      dead.forEach(({ age }) => {
        if(age < minAge){
          minAge = age
        }
      })
      dead.forEach(creature => {
        creature.genome.fitness = (creature.age - minAge) ** 2 //+*/ creature.consumed ** 2
      })
      species.applyFitnessFunc() // fitness decided in game, already set by *shudders* reference

      const fitToAge = ({ fitness = 0 }) => minAge + Math.sqrt(fitness)
        
      let toMax = (max, f = 0) => f > max ? f : max
      let stats = [
        [ "Previous Round's Max Age", species.genes.map(fitToAge).reduce(toMax, 0) ],
        [ "All Time Max Age", fitToAge(species.hallOfFame[0] || {}) ],
        [ "Previous Top per population", species.bestOfSubPopulation.map(fitToAge).join(', ') ],
      ]
      species.evolve()
      let { board, creatures } = generationBoard(species.genes) 
      stats = [
        [ "Generation", species.getNumGeneration() ],
        [ "Max Nodes", creatures.map(c => c.brain.nodes).reduce(toMax, 0) ],
        [ "Max Connections", creatures.map(c => c.brain.connections).reduce(toMax, 0) ],
        ...stats
      ]
      if(this.state.offlineRounds){
        clearInterval(this.state.interval)
        this.setState({ interval: NaN, round, board, species, stats })
        offline({ species, board, rounds: this.state.offlineRounds })
          .then(state => (
            this.setState(Object.assign(state, { runningOffline: false })),
            this.setInterval()
          ))
      } else {
        this.setState({ round, board, species, stats })
      }
    } else {
      this.setState({ round })
    }
  }

  componentDidMount() {
    this.setState({ interval: setInterval(this.step.bind(this), this.state.stepInterval) })
  }

  setInterval = () => {
    clearInterval(this.state.interval)
    this.setState({ interval: setInterval(this.step.bind(this), this.state.stepInterval) })
  }

  componentWillUnmount(){ clearInterval(this.state.interval) }

  render() {
    let size = `${(1 / this.state.board.board[0].length) * 50}vw`
    return (
      <div className="App">
        <div>
          { this.state.interval === 'NaN' && 'running offline' }
          <br/>
          Step Interval: <input type='number' value={this.state.stepInterval}
            onChange={e => this.setState({ stepInterval: Number(e.target.value) || 50 })} />
          <button onClick={this.setInterval}>Set Interval</button>
          <br/>
          Offline Rounds: <input type='number' value={this.state.offlineRounds}
            onChange={e => this.setState({ offlineRounds: Number(e.target.value) || 0 })} />
          <p>
            { (this.state.stats || []).map(([k, v]) => <span key={k}>{k}: {v}<br/></span>) }
          </p>
        </div>
        <div className="grid">
          { this.state.board.board.map((row: Array<any>, rowIndex: number) => (
            <div className="row" style={{ height: size }} key={rowIndex}>
              { row.map((cell: any = {}, columnIndex: number) => <Cell {...cell} size={size} key={columnIndex}/>) }
            </div>
            )
          ) }
        </div>
        <div style={{float: 'left'}}>
          { JSON.stringify(Array.from(this.state.board.actors).reduce(
            (stats, { action }) => (stats[action || 'none'] += 1, stats),
            { bite: 0, push: 0, pull: 0, none: 0 }
          )) }
        </div>
      </div>
    );
  }
}

export default App;
