import express from "express";
import { TurnService } from "../application/TurnService";

export const turnRouter = express.Router();

const turnService = new TurnService();

interface TurnGetRequestDto {
  turnCount: number;
  board: number[][];
  nextDisc: number | null;
  winnerDisc: number | null;
}

turnRouter.get(
  "/api/games/latest/turns/:turnCount",
  async (req, res: express.Response<TurnGetRequestDto>) => {
    const turnCount = parseInt(req.params.turnCount);

    const outputDto = await turnService.findLatestGameTurnByTurnCount(
      turnCount
    );

    const responseBody: TurnGetRequestDto = {
      turnCount: outputDto.turnCount,
      board: outputDto.board,
      nextDisc: outputDto.nextDisc ?? null,
      winnerDisc: outputDto.winnerDisc ?? null,
    };

    res.json(responseBody);
  }
);

interface TurnPostRequestDto {
  turnCount: number;
  move: {
    disc: number;
    x: number;
    y: number;
  };
}

turnRouter.post(
  "/api/games/latest/turns",
  async (
    req: express.Request<{}, {}, TurnPostRequestDto>,
    res: express.Response
  ) => {
    const turnCount = req.body.turnCount;
    const disc = req.body.move.disc;
    const x = req.body.move.x;
    const y = req.body.move.y;

    await turnService.registerTurn(turnCount, disc, x, y);

    res.status(201).end();
  }
);
