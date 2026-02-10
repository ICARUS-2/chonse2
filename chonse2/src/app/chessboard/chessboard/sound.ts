import AlgebraicNotationMaker from "../../../lib/algebraic-notation-builder";

export default class Sound 
{
    static readonly BASE_PATH = "sounds/"
    static readonly CAPTURE = this.BASE_PATH + "capture.mp3";
    static readonly CHECK = this.BASE_PATH + "check.mp3";
    static readonly CHECKMATE = this.BASE_PATH + "checkmate.mp3"; //https://freesound.org/people/Timbre/sounds/232210/
    static readonly MOVE = this.BASE_PATH + "move.mp3";
    static readonly START = this.BASE_PATH + "start.mp3";

    static playSound(audioFilePath: string): void 
    {
        const audio = new Audio(audioFilePath);
        audio.play()
            .catch(error => { console.error("Audio playback failed:", error);
            }); 
    }

    static playSoundForMove(notation: string)
    {
        if (notation.includes(AlgebraicNotationMaker.CHECK))
        {
            Sound.playSound(Sound.CHECK);
            return;
        }
        
        if (notation.includes(AlgebraicNotationMaker.CAPTURE))
        {
            Sound.playSound(Sound.CAPTURE);
            return;
        }

        if (notation.includes(AlgebraicNotationMaker.CHECKMATE))
        {
            Sound.playSound(Sound.CHECK);
            setTimeout( () => {Sound.playSound(Sound.CHECKMATE);}, 400)
            return;
        }
        
        Sound.playSound(Sound.MOVE);
    }
}