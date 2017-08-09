import * as React from 'react';
import './App.css'
import generationBoard, { offline } from './game'
import trainer from './creature/genes'

function Cell({ color = [ 255, 255, 255 ], size }: { color: [ number, number, number ], size: string }) {
  let style = {
    backgroundColor: `rgb(${color.join(', ')})`,
    width: size,
    height: size,
  }
  return <div className='cell' style={style} />
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
    maxes?: any,
}

class App extends React.Component<SectionProps, SectionState> {
  constructor(props: SectionProps) {
    super(props)
    let species = trainer()
    let board = generationBoard(species.genes)
    this.state = {
      round: 0,
      board,
      species,
      offlineRounds: 10,
      stepInterval: 10
    }
  }

  step = () => {
    let { living, dead } = this.state.board.turn()
    let round = this.state.round + 1
    if(!living.length){
      let species = this.state.species

      species.applyFitnessFunc() // fitness decided in game, already set by *shudders* reference

      const fitToAge = ({ fitness = 0 }) => Math.sqrt(fitness)
        
      let maxes = {
        "Previous Round's Max Age": species.genes.map(fitToAge).reduce((max, f = 0) => f > max ? f : max, 0),
        "All Time Max Age": fitToAge(species.hallOfFame[0] || {}),
        "Top per population": species.bestOfSubPopulation.map(fitToAge).join(', ')
      }

      species.evolve()
      let board = generationBoard(species.genes) 
      //, ...offline({ species, board, rounds: this.state.offlineRounds })
      this.setState({ round, board, species, maxes })
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
          <br/>
          Step Interval: <input type='number' value={this.state.stepInterval}
            onChange={e => this.setState({ stepInterval: Number(e.target.value) || 50 })} />
          <button onClick={this.setInterval}>Set Interval</button>
          <br/>
          Offline Rounds: <input type='number' value={this.state.offlineRounds}
            onChange={e => this.setState({ offlineRounds: Number(e.target.value) || 0 })} />
          <p>
            Generation: {this.state.species.getNumGeneration()}
            <br/>
            Nodes: ~{this.state.species.genes[0].model.nodes.length}
            <br/>
            Connections: ~{this.state.species.genes[0].connections.length}
            <br/>
            Stats:<br/>
            { Object.keys(this.state.maxes || {}).map(k => <span key={k}>{k} max age: {this.state.maxes[k]}<br/></span>) }
          </p>
        </div>
        <div className="grid">
          { this.state.board.board.map((row: Array<any>, rowIndex: number) => (
            <div className="row" style={{ height: size }} key={rowIndex}>
              { row.map((cell: any = {}, columnIndex: number) => <Cell color={cell.color} size={size} key={columnIndex}/>) }
            </div>
            )
          ) }
        </div>
      </div>
    );
  }
}

export default App;
