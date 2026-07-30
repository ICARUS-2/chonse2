import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { VsAiConfigurationModal } from "./vs-ai-configuration-modal/vs-ai-configuration-modal";
import BoardState from "../chessboard/chessboard/board-state";
import { ChessBoardService } from "../chessboard/chessboard/chess-board-service";
import { BoardNames } from "../boards";
import { Chessboard } from "../chessboard/chessboard/chessboard";
import { ToastrService } from "ngx-toastr";
import Chonse2 from "../../libs/chonse2-lib/chonse2";
import { EngineInformation, EngineName } from "../../libs/engine-lib/types/enums";
import { TranslateService } from "@ngx-translate/core";

export default class VsAiConfigurationModalHelper
{
    static doModal = async (
        modalService: NgbModal, 
        chessBoardService: ChessBoardService, 
        toastr: ToastrService, 
        translate: TranslateService,
        componentInstance: Chessboard,
        startingState: Chonse2 | undefined = undefined) =>
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
                    const engineDisplayName = EngineInformation.get(engine.name as EngineName)?.displayName?.toString() ?? "-";

                    isHumanWhite ? (bs.pgnHeaders().black = engineDisplayName) : (bs.pgnHeaders().white = engineDisplayName)
                    isHumanWhite ? (bs.pgnHeaders().blackElo = engineElo) : (bs.pgnHeaders().whiteElo = engineElo);
                    isHumanWhite ? (bs.pgnHeaders().white = translate.instant("vsAiModal.you")) : (bs.pgnHeaders().black = translate.instant("vsAiModal.you"));

                    chessBoardService.deleteGame(BoardNames.VsAi);
                    chessBoardService.addGame(BoardNames.VsAi, bs);
                    componentInstance.boardState.set(chessBoardService.getGame(BoardNames.VsAi));

                    toastr.success(translate.instant("vsAiModal.toastr.startingGame"));

                    //If stockfish is white (or if the board says it's stockfish's color to move), play the first move.
                    if (startingState)
                    {
                        if ((!startingState.getTurn() && isHumanWhite) || (startingState.getTurn() && !isHumanWhite))
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
                toastr.error(translate.instant("vsAiModal.toastr.error") + ex)
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