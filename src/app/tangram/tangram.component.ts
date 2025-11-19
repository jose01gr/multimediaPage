import { Component, OnInit, OnDestroy } from '@angular/core';
import { FileService } from '../file.service';
import { FileData } from '../file.service';

@Component({
  selector: 'app-tangram',
  templateUrl: './tangram.component.html',
  styleUrls: ['./tangram.component.css'],
  standalone: true
})
export class TangramComponent implements OnInit, OnDestroy {
  audios: FileData[] = [];
  audioElements: HTMLAudioElement[] = [];
  timer: any;

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.fileService.getFilesByType('audio').subscribe(files => {
      console.log('Audios cargados:', files);
      this.audios = files;
      this.audioElements = files.map(file => new Audio(file.fileUrl));
      this.startAudioSync();
    });
  }

  startAudioSync() {
    const ANIMATION_DURATION = 5000;
    const calculateTiming = (percentage: number) => (ANIMATION_DURATION * percentage) / 100;

    setTimeout(() => {
      const playSequence = () => {
        // Transition 1 (0% - 20%)
        this.playAudio(0);

        // Transition 2 (22% - 60%)
        setTimeout(() => {
          this.playAudio(1);
        }, calculateTiming(22));

        // Transition 3 (62% - 90%)
        setTimeout(() => {
          this.playAudio(2);
        }, calculateTiming(62));
      };

      playSequence();

      this.timer = setInterval(playSequence, ANIMATION_DURATION);
    }, 5000);
  }

  playAudio(index: number) {
    if (this.audioElements.length > 0) {
      // Detener audios anteriores
      this.audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });

      // Reproducir nuevo audio
      this.audioElements[index].play()
        .catch(err => console.error(`Error reproduciendo audio ${index + 1}:`, err));
    }
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}