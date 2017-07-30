interface PiecePosition {
  row: number,
  column: number
}

interface PieceMovement {
  from: PiecePosition,
  to: PiecePosition
}

interface PieceBase {
  position: PiecePosition,
  color: string,
  weight: number
}

interface Food extends PieceBase {
  energy: number
}

interface Creature extends Food {
  action: 'push' | 'pull' | 'bite' | null ,
  direction: 'right' | 'left' | 'up' | 'down' ,
}

type Piece = PieceBase | Food | Creature

interface GameBoard {
  dimensions: { rows: number, columns: number },
  board: any,
  actors: Set<string>
}
