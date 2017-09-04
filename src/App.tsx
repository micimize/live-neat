import * as React from 'react';
import './App.css'
import generationBoard from './game'

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
    interval?: any,
    stepInterval?: number,
}

class App extends React.Component<SectionProps, SectionState> {
  constructor(props: SectionProps) {
    super(props)
    let board = generationBoard()
    this.state = {
      round: 0,
      board,
      stepInterval: 10
    }
  }

  step = async () => {
    if(this.state.board.moving){
      return
    }
    await this.state.board.turn()
    this.setState({ round: this.state.round + 1 })
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
          {/*
          <br/>
          <p>
            { (this.state.stats || []).map(([k, v]) => <span key={k}>{k}: {v}<br/></span>) }
          </p>
          */}
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
          { JSON.stringify(Array.from(this.state.board.population.creatures).reduce(
            (stats, { action }) => (stats[action || 'none'] += 1, stats),
            { bite: 0, push: 0, pull: 0, none: 0 }
          )) }
        </div>
      </div>
    );
  }
}

export default App;
