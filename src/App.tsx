import * as React from 'react';
import './App.css'
import generationBoard from './game'
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
    stepInterval?: number
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
      stepInterval: 10
    }
  }

  step = () => {
    let { living, dead } = this.state.board.turn()
    let round = this.state.round + 1
    if(!living.length){
      let species = this.state.species
      species.applyFitnessFunc() // fitness decided in game, already set by *shudders* reference
      species.evolve()
      let board = generationBoard(species.genes)
      this.setState({ round, board, species })
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
        <div className="grid">
          { this.state.board.board.map((row: Array<any>, rowIndex: number) => (
            <div className="row" style={{ height: size }} key={rowIndex}>
              { row.map((cell: any, columnIndex: number) => <Cell {...cell} size={size} key={columnIndex}/>) }
            </div>
            )
          ) }
        </div>
        <div>
          <br/>
          <input type='number' value={this.state.stepInterval}
            onChange={e => this.setState({ stepInterval: Number(e.target.value) || 50 })} />
          <button onClick={this.setInterval}>Set Interval</button>
          <p>
            Generation: {this.state.species.getNumGeneration()}
            <br/>
            Connections: ~{this.state.species.genes[0].connections.length}
          </p>
        </div>
      </div>
    );
  }
}

export default App;
