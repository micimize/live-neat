import * as React from 'react';
import './App.css'
import Board from './Board'

function Cell({ color = 'white' }) {
  return <div className='cell' style={{ backgroundColor: color }} />
}


interface SectionProps {
}

interface SectionState {
    round: number,
    board: any,
    interval?: any
}

class App extends React.Component<SectionProps, SectionState> {
  constructor(props: SectionProps) {
    super(props)

    let board = new Board({ rows: 50, columns: 50 })
    board.addActor({
      position: { row: 3, column: 3 },
      action: 'push',
      color: 'blue',
      direction: 'right',
      weight: 5, 
      energy: 5 
    })
    board.addObject({
      position: { row: 3, column: 3 },
      color: 'green',
      weight: 3,
      energy: 3 
    })
    board.addObject({
      position: { row: 3, column: 5 },
      color: 'green',
      weight: 1,
      energy: 5 
    })
    this.state = {
      round: 0,
      board
    }
  }

  step = () => {
    this.state.board.resolveMoves()
    this.setState({
      round: this.state.round + 1,
    })
  }

  componentDidMount() {
    this.setState({ interval: setInterval(this.step.bind(this), 100) })
  }

  componentWillUnmount(){ clearInterval(this.state.interval) }

  render() {
    return (
      <div className="App">
        <div className="grid">
          { this.state.board.board.map((row: Array<any>, rowIndex: number) => (
            <div className="row" key={rowIndex}>
              { row.map((cell: any, columnIndex: number) => <Cell {...cell}  key={columnIndex}/>) }
            </div>
            )
          ) }
        </div>
      </div>
    );
  }
}

export default App;
