export class SquareRecord {
  constructor(
    private readonly _id: number,
    private readonly _turnId: number,
    private readonly _x: number,
    private readonly _y: number,
    private readonly _disc: number
  ) {}

  get y(): number {
    return this._y;
  }

  get x(): number {
    return this._x;
  }

  get disc(): number {
    return this._disc;
  }
}
