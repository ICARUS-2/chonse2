import { inject, Injectable } from '@angular/core';
import { ChessBoardService } from '../chessboard/chessboard/chess-board-service';
import BoardState from '../chessboard/chessboard/board-state';
import LocalStorageHelper from '../../libs/local-storage-helper';
import GameLinkHelper from '../chessboard/chessboard/game-link-helper';
import { GameScore } from '../../libs/chonse2-lib/game-state';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService 
{
  public saveToDatabase(game: BoardState, comment: string = ""): boolean
  {
    const allGames = this.getGamesFromDatabase();

    //new id if there's nothing already in the db
    let newId = 1;

    //if there's at least one item, auto increment primary key.
    if (allGames.length > 0)
    {
      const lastSavedGame = allGames.at(-1);
      if (lastSavedGame)
      {
        newId = lastSavedGame.id + 1;
      }
    }

    //new record to be added.
    const record = new DatabaseItem();

    //the eval result of the passed game for elo and accuracy.
    const gameEval = game.eval();

    //for saving the result.
    const finalGameState = game.mainStateStack().at(-1);

    //set main fields.
    record.id = newId;
    record.pgn = GameLinkHelper.compressStringForUrl(game.exportPGN());
    record.white = `${game.pgnHeaders().white} ${game.pgnHeaders().whiteElo ? `(${game.pgnHeaders().whiteElo})` : ""}`;
    record.black = `${game.pgnHeaders().black} ${game.pgnHeaders().blackElo ? `(${game.pgnHeaders().blackElo})` : ""}`

    //if the game actually had a result, set it.
    if (finalGameState != undefined)
    {
      record.result = `${finalGameState.gameState.reason} ${finalGameState.gameState.gameScore == GameScore.IN_PROGRESS ? "" : finalGameState.gameState.gameScore}`
    }

    //if the game was evaluated, set its basic estimation/accuracies.
    if (gameEval != undefined)
    {
      record.whiteAccuracy = `${Number(gameEval.estimatedElo?.white).toFixed(0)} / ${gameEval.accuracy.white.toFixed(1)}%`;
      record.blackAccuracy = `${Number(gameEval.estimatedElo?.black).toFixed(0)} / ${gameEval.accuracy.black.toFixed(1)}%`;
    }

    //additional comment to help the user identify the game.
    record.comment = comment;

    //try saving it and hope it works.
    try 
    {
      allGames.push(record);
      LocalStorageHelper.setString(LocalStorageHelper.DATABASE, JSON.stringify(allGames));
    }
    catch(ex)
    {
      console.error(ex);
      return false;
    }

    return true;
  }

  public getGamesFromDatabase(): Array<DatabaseItem>
  {
    const fromLocal = LocalStorageHelper.getString(LocalStorageHelper.DATABASE, "");
  
    if (!fromLocal)
    {
      return [];
    }

    const instances: Array<DatabaseItem> = JSON.parse(fromLocal);

    return instances;
  }

  public deleteFromDatabase(id: number): boolean
  {
    try 
    {
      const allGames = this.getGamesFromDatabase();

      const newGames = allGames.filter( g => g.id != id );

      LocalStorageHelper.setString(LocalStorageHelper.DATABASE, JSON.stringify(newGames));
    
      return allGames.length != newGames.length;
    }
    catch(ex)
    {
      console.error(ex);
      return false;
    }
  }
}

export class DatabaseItem
{
  id: number = -1;
  pgn: string = "";
  white: string = "White";
  black: string = "Black";
  result: string = "-";
  whiteAccuracy: string = "-";
  blackAccuracy: string = "-"
  comment: string = "";
}