
type ActionResult = [ boolean , number, PiecePosition ]

const moves = {
  'right': [ 0,  1],
  'left':  [ 0, -1],
  'up':    [-1,  0],
  'down':  [ 1,  0],
}

function relativePosition({ row, column }: PiecePosition, [ x, y ]: [ number, number ]){
  return {
    row: row + x,
    column: column + y
  }
}

export function pull(position: PiecePosition, { force, direction }, board): ActionResult{

  let target = relativePosition(position, direction)
  let backingInto = relativePosition(position, direction.map(d => -d))

  // we can't pull outside the board, we can't back outside the board or in to things
  if (
    !board.isInBounds(target) ||
    !board.isInBounds(backingInto) ||
    board.getCell(backingInto)
  ) {
    return [ false, 0, position ]
  }

  let targetCell = board.getCell(target)

  if (!targetCell) {
    board.move({ from: position, to: target })
    return [ true, force, target ]
  }

  if(force < targetCell.weight){
    return [ false, 0, position ]
  } else {
    board.move({ from: position, to: backingInto })
    board.move({ from: target, to: position })
    return [ true, force - targetCell.weight, backingInto ] 
  }
}

export function push(position: PiecePosition, { force, direction }, board): ActionResult{
  let target = relativePosition(position, direction)

  // we can't push outside the board
  if (!board.isInBounds(target)) {
    return [ false, 0, position ]
  }

  let targetCell = board.getCell(target)

  if (!targetCell) {
    board.move({ from: position, to: target })
    return [ true, force, target ]
  }

  // if we can't move the cell we're targetting, attempt fails
  if(force < targetCell.weight){
    return [ false, 0, position ]
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
      return [ false, 0, position ]
    }
    force = f
  }

  board.move({ from: position, to: target })
  return [ true, force, target ] 
}

export function bite(position: PiecePosition, { force, direction }, board): ActionResult{
  // biting inorganic things hurts
  let target = relativePosition(position, direction)

  // we can't push outside the board
  if (!board.isInBounds(target)) {
    return [ false, -force, position ]
  }

  let targetCell = board.getCell(target)
  let actor = board.getCell(position)

  if (!targetCell) {
    return [ false, force - 1, position ]
  }
  if (!targetCell.energy || actor.color == targetCell.color) {
    return [ false, -force, position ]
  }

  let drainedEnergy = Math.floor(targetCell.energy / targetCell.weight)
  let gainedEnergy = targetCell.energy === drainedEnergy ?
    drainedEnergy :
    Math.floor(drainedEnergy / 4)
  board.setCell(target, { merge: {
    weight: targetCell.weight - force,
    energy: targetCell.energy - drainedEnergy
  }})
  return [ true, gainedEnergy, position ]

}

