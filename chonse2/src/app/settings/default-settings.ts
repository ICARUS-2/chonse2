import { EngineName } from '../../libs/engine-lib/types/enums';
import { UciEngine } from '../../libs/engine-lib/uciEngine';
import ChessboardHelper from '../chessboard/helpers';
import ThemeService from '../themes/theme-service';
import { DEFAULT_LANG } from '../../globals/globals';
import { Themes } from '../themes/themes';

export default class DefaultSettings
{
    //Board
    static readonly CLICK_TO_MOVE = false;
    static readonly PIECE_ANIMATIONS = true;
    static readonly CHESS_PIECES = ChessboardHelper.DEFAULT_PIECE_SET;
    static readonly VERBOSE_NOTATION = false;

    //Engine
    static readonly SELECTED_ENGINE = UciEngine.DEFAULT_ENGINE;
    static readonly ENGINE_DEPTH = UciEngine.DEFAULT_DEPTH;
    static readonly MANUAL_ENGINE_DEPTH = UciEngine.DEFAULT_DEPTH;
    static readonly CLOUD_HYBRID_MODE = true;
    static readonly ENGINE_THREAD_COUNT = 1;

    //Appearance
    static readonly SELECTED_THEME = Themes.WhiteAndBlue;
    static readonly LANGUAGE = DEFAULT_LANG;

    //Coach
    static readonly INSIGHTS_AUDIO = true;
    static readonly SHOW_ALT_LINE_ARROW = true;
}