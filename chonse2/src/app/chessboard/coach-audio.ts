import { Service } from '@angular/core';
import { FormattedCoachSentence } from '../../libs/coach-lib/coach-types';

@Service()
export class CoachAudio 
{
    private currentAudio: HTMLAudioElement | null = null;
    private currentPlaybackId = 0;
    static readonly BASE_AUDIO_PATH = "sounds/coach/"

    //Plays the given sentences back to back. If a sequence is already playing,
    //it's stopped immediately and this new one starts right away.
    public playSentences(sentences: Array<FormattedCoachSentence>): void
    {
        const playbackId = ++this.currentPlaybackId;
        this.stopCurrentAudio();
        this.playFrom(sentences, 0, playbackId);
    }

    //Stops whatever is currently playing without starting anything new.
    public stop(): void
    {
        this.currentPlaybackId++;
        this.stopCurrentAudio();
    }

    private playFrom(sentences: Array<FormattedCoachSentence>, index: number, playbackId: number): void
    {
        //A newer call to playSentences() or stop() has already superseded this run.
        if (playbackId !== this.currentPlaybackId || index >= sentences.length)
        {
            return;
        }

        const path = `${CoachAudio.BASE_AUDIO_PATH}${sentences[index].audioPath}`

        if (path == CoachAudio.BASE_AUDIO_PATH)
        {
            this.playFrom(sentences, index + 1, playbackId);
        }

        const audio = new Audio(path);
        this.currentAudio = audio;

        audio.onended = () =>
        {
            this.playFrom(sentences, index + 1, playbackId);
        };

        audio.onerror = () =>
        {
            console.warn(`CoachAudio: couldn't play ${path}, skipping ahead.`);
            this.playFrom(sentences, index + 1, playbackId);
        };

        void audio.play().catch((error) =>
        {
            //play() rejects when pause() interrupts it mid-request - expected during
            //a takeover, so only treat it as a real error if we're still current.
            if (playbackId === this.currentPlaybackId)
            {
                console.warn('CoachAudio: playback failed to start.', error);
            }
        });
    }

    private stopCurrentAudio(): void
    {
        if (this.currentAudio)
        {
            this.currentAudio.onended = null;
            this.currentAudio.onerror = null;
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    }
}
