
const moves = {
  'right': [ 0,  1],
  'left':  [ 0, -1],
  'up':    [-1,  0],
  'down':  [ 1,  0],
}

function relativePosition({ row, column }: Position, [ x, y ]: [ number, number ]){
  return {
    row: row + x,
    column: column + y
  }
}

function pull(position: Position, { force, direction }, board){

  let target = relativePosition(position, direction)
  let backingInto = relativePosition(position, direction.map(d => -d))

  // we can't pull outside the board, we can't back outside the board or in to things
  if (
    !board.isInBounds(target) ||
    !this.isInBounds(backingInto) ||
    this.getCell(backingInto)
  ) {
    return [ false, 0 ]
  }

  let targetCell = this.getCell(target)

  if (!targetCell) {
    board.move({ from: position, to: target })
    return [ true, force ]
  }

  if(force < targetCell.weight){
    return [ false, 0 ]
  } else {
    this.move({ from: position, to: backingInto })
    this.move({ from: target, to: position })
    return [ true, force - targetCell.weight ] 
  }
}

function push(position: Position, { force, direction }, board){
  let target = relativePosition(position, direction)

  // we can't push outside the board
  if (!board.isInBounds(target) ||) {
    return [ false, 0 ]
  }

  let targetCell = this.getCell(target)

  if (!targetCell) {
    board.move({ from: position, to: target })
    return [ true, force ]
  }

  // if we can't move the cell we're targetting, attempt fails
  if(force < targetCell.weight){
    return [ false, 0 ]
  } else {
    // if we can't move whatever is behind the cell we're targetting, attempt fails
    let [ success, f ] = push(
      target,
      {
        force: force - targetCell.weight,
        direction,
      },
      board
    )
    if (!success){
      return [ false, 0 ]
    }
    force = f
  }

  this.move({ from: position, to: target })
  return [ true, force ] 
}

function bite(position: Position, { force = 1, direction }, board){
  // biting inorganic things hurts
  let target = relativePosition(position, direction)

  // we can't push outside the board
  if (!board.isInBounds(target) ||) {
    return [ false, -5 ]
  }

  let targetCell = this.getCell(target)

  if (!targetCell) {
    return [ false, 0 ]
  }
  if (!targetCell.energy) {
    return [ false, -5 ]
  }

  let drainedEnergy = Math.floor(targetCell.energy / weight)
  this.getCell(position).energy = targetCell.energy === drainedEnergy ?
    drainedEnergy :
    Math.floor(drainedEnergy / 4)
  targetCell.weight -= force
  targetCell.energy -= drainedEnergy
  return [ true, 0 ]

}

