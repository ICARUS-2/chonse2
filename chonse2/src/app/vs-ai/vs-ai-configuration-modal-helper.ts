import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { VsAiConfigurationModal } from "./vs-ai-configuration-modal/vs-ai-configuration-modal";
import BoardState from "../chessboard/chessboard/board-state";
import { ChessBoardService } from "../chessboard/chessboard/chess-board-service";
import { BoardNames } from "../boards";
import { Chessboard } from "../chessboard/chessboard/chessboard";
import { ToastrService } from "ngx-toastr";
import { EngineDisplayName, EngineName } from "../../engine-lib/types/enums";
import Chonse2 from "../../chonse2-lib/chonse2";

export default class VsAiConfigurationModalHelper
{
    static doModal = async (modalService: NgbModal, chessBoardService: ChessBoardService, toastr: ToastrService, componentInstance: Chessboard,startingState: Chonse2 | undefined = undefined) =>
    {
        const modalRef = modalService.open(VsAiConfigurationModal, {size: 'lg'})

        modalRef.result.then( async (result) =>
        {
            try 
            {
                //Configure board state and stockfish.
                const isHumanWhite = result.getIsHumanPlayerWhite();
                const engineElo = result.getElo()

                const bs: BoardState = new BoardState();

                //If the board editor passed in a state, set it.
                if (startingState)
                {
                    bs.mainStateStack.set([startingState])
                }

                bs.isVsAi.set(true);
                bs.humanPlayerIsWhite.set(isHumanWhite);
                bs.aiElo.set(result.getElo());

                if (!isHumanWhite)
                {
                    bs.isFlipped.set(true);
                }

                await bs.setEngineIfNotExists();

                const engine = bs.engine();
                if (engine)
                {
                    const engineDisplayName = EngineDisplayName.get(engine.name as EngineName)?.toString() ?? "-";

                    isHumanWhite ? (bs.pgnHeaders().black = engineDisplayName) : (bs.pgnHeaders().white = engineDisplayName)
                    isHumanWhite ? (bs.pgnHeaders().blackElo = engineElo) : (bs.pgnHeaders().whiteElo = engineElo);
                    isHumanWhite ? (bs.pgnHeaders().white = "You") : (bs.pgnHeaders().black = "You");

                    chessBoardService.deleteGame(BoardNames.VsAi);
                    chessBoardService.addGame(BoardNames.VsAi, bs);
                    componentInstance.boardState.set(chessBoardService.getGame(BoardNames.VsAi));

                    toastr.success(`Starting game vs Stockfish ${engineElo}`);

                    //If stockfish is white (or if the board says it's stockfish's color to move), play the first move.
                    if (startingState)
                    {
                        if ((!startingState.turn && isHumanWhite) || (startingState.turn && !isHumanWhite))
                        {
                            componentInstance.playAIMove();
                        }
                    }
                    else 
                    {
                        if (!isHumanWhite)
                        {
                            if (componentInstance.boardState().engine())
                            {
                                componentInstance.playAIMove();
                            }
                        }
                    }
                }
                else 
                {
                    throw("Engine not initialized");
                }
            }
            catch(ex)
            {
                toastr.error("Error starting game: " + ex)
            }
        }
        )
        .catch(c => 
        {
        //this.toastr.info("vs AI - Operation cancelled");
        }
        )
    }
}