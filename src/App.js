import React, { Component } from 'react'
import './App.css'
import Board from './Board'

  /*
function choose(choices) {
  var index = Math.floor(Math.random() * choices.length)
  return choices[index]
}*/

function Cell({ color = 'white' }) {
  return <div className='cell' style={{ backgroundColor: color }} />
}

/*
let food = new Map([
  [[5, 6], { weight: 3 }]
])

cell moves
{ up, down, left, right } | { pull, push }
creature attrs:
  // brain: [],
  //vision: []
*/


class App extends Component {
  constructor(props: SectionProps) {
    super(props)

    let board = new Board({ rows: 50, columns: 50 })
    board.addActor(3, 3, {
      action: 'push',
      color: 'blue',
      direction: 'right',
      weight: 5 
    })
    board.addObject(3, 4, {
      color: 'green',
      weight: 3 
    })
    board.addObject(3, 5, {
      color: 'green',
      weight: 1 
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

  componentDidMount = () => {
    this.interval = setInterval(this.step.bind(this), 100)
  }

  componentWillUnmount = () => clearInterval(this.interval)

  render() {
    return (
      <div className="App">
        <div className="grid">
          { this.state.board.board.map((row, rowIndex) => (
            <div className="row" key={rowIndex}>
              { row.map((cell, columnIndex) => <Cell {...cell}  key={columnIndex}/>) }
            </div>
            )
          ) }
        </div>
      </div>
    );
  }
}

export default App;
