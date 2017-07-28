import React, { Component } from 'react';
import './App.css';

function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function Cell({ color = 'white' }) {
  return <div className='cell' style={{ backgroundColor: color }} />
}

/*
cell moves
{ up, down, left, right } | { pull, push }
creature attrs:
  // brain: [],
  //vision: []
*/

const moves = {
  'right': [ 0,  1],
  'left':  [ 0, -1],
  'up':    [-1,  0],
  'down':  [ 1,  0],
}

function step(cells) {
  let movedInto = []
  for (let row = 0; row < cells.length; row++) {
    let rowCells = cells[row]
    for (let column = 0; column < rowCells.length; column++) {
      let cell = rowCells[column]
      if (!cell || movedInto.includes( row * 100 + column )) {
        continue
      }
      let newCell = Object.assign(cell, { direction: choose(['right', 'left', 'up', 'down']) })
      if(cell.direction) {
        let [ dRow, dColumn ] = moves[ cell.direction ]
        let newRow = row + dRow
        let newColumn = column + dColumn
        if (newRow > 0 && newColumn > 0) {
          cells[ newRow ][ newColumn ] = newCell
          movedInto.push( newRow * 100 + newColumn )
          cells[row][column] = undefined
        }
      }
    }
  }
  return cells
}

class App extends Component {
  constructor(props: SectionProps) {
    super(props)

    let cells = Array(50).fill().map(_ => Array(50).fill()) 
    cells[3][3] = {
      color: 'blue',
      force: 'push',
      direction: 'right',
      weight: 5 
    }
    this.state = {
      round: 0,
      cells
    }
  }

  step = () => {
    this.setState({
      round: this.state.round + 1,
      cells: step(this.state.cells)
    })
  }

  componentDidMount = () => {
    this.interval = setInterval(this.step, 1000)
  }

  componentWillUnmount = () => clearInterval(this.interval)

  render() {
    return (
      <div className="App">
        <div className="grid">
          { this.state.cells.map((row, rowIndex) => (
            <div className="row">
              { row.map((cell, columnIndex) => <Cell {...cell}/>) }
            </div>
            )
          ) }
        </div>
      </div>
    );
  }
}

export default App;
