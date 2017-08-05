import * as React from 'react';
import './App.css'
import generationBoard from './game'
import genes from './creature/genes'

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
    let board = generationBoard(genes().filter((_, i: number = 100) => i < 10))
    this.state = {
      round: 0,
      board
    }
  }

  step = () => {
    debugger;
    this.state.board.turn()
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
