import { connectMySQL } from "../infrastructure/connection";
import { GameRepository } from "../domain/game/gameRepository";
import { toDisc } from "../domain/turn/disc";
import { Point } from "../domain/turn/point";
import { TurnRepository } from "../domain/turn/turnRepository";

const turnRepository = new TurnRepository();

class FindLatestGameTurnByTurnCountOutputDto {
  constructor(
    private _turnCount: number,
    private _board: number[][],
    private _nextDisc: number | undefined,
    private _winnerDisc: number | undefined
  ) {}

  get turnCount() {
    return this._turnCount;
  }

  get board() {
    return this._board;
  }

  get nextDisc() {
    return this._nextDisc;
  }

  get winnerDisc() {
    return this._winnerDisc;
  }
}

const gameRepository = new GameRepository();

export class TurnService {
  async findLatestGameTurnByTurnCount(
    turnCount: number
  ): Promise<FindLatestGameTurnByTurnCountOutputDto> {
    const conn = await connectMySQL();
    try {
      const game = await gameRepository.findLatest(conn);

      if (!game) {
        throw new Error("Latest game not found");
      }
      if (!game.id) {
        throw new Error("game.id not exists");
      }

      const turn = await turnRepository.findForGameIdAndTurnCount(
        conn,
        game.id,
        turnCount
      );

      return new FindLatestGameTurnByTurnCountOutputDto(
        turnCount,
        turn.board.discs,
        turn.nextDisc,
        // TODO 決着がついている場合、game_results テーブルから取得する
        undefined
      );
    } finally {
      await conn.end();
    }
  }

  async registerTurn(turnCount: number, disc: number, x: number, y: number) {
    const conn = await connectMySQL();
    try {
      await conn.beginTransaction();

      // 1つ前のターンを取得する
      const game = await gameRepository.findLatest(conn);

      if (!game) {
        throw new Error("Latest game not found");
      }
      if (!game.id) {
        throw new Error("game.id not exists");
      }

      const previousTurnCount = turnCount - 1;
      const previousTurn = await turnRepository.findForGameIdAndTurnCount(
        conn,
        game.id,
        previousTurnCount
      );

      // 石を置く
      const nextTurn = previousTurn.placeNext(toDisc(disc), new Point(x, y));

      // ターンを保存する
      await turnRepository.save(conn, nextTurn);

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}
