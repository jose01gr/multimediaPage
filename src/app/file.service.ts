
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

export interface FileData {
  textContent: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

interface AudioTransitions {
  transition1: HTMLAudioElement;
  transition2: HTMLAudioElement;
  transition3: HTMLAudioElement;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private audioTransitions: AudioTransitions | null = null;

  constructor(private firestore: AngularFirestore) {}

  initializeAudios(audioUrls: { [key: string]: string }) {
    this.audioTransitions = {
      transition1: new Audio(audioUrls['transition1']),
      transition2: new Audio(audioUrls['transition2']),
      transition3: new Audio(audioUrls['transition3'])
    };
  }

  playTransitionAudio(transitionNumber: number) {
    if (!this.audioTransitions) return;

    // Detener cualquier audio que esté reproduciéndose
    Object.values(this.audioTransitions).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Reproducir el audio correspondiente
    switch (transitionNumber) {
      case 1:
        this.audioTransitions.transition1.play();
        break;
      case 2:
        this.audioTransitions.transition2.play();
        break;
      case 3:
        this.audioTransitions.transition3.play();
        break;
    }
  }

  // Devuelve un observable con todos los archivos
  getAllFiles(): Observable<FileData[]> {
    return this.firestore.collection<FileData>('files').valueChanges();
  }

  // Devuelve un observable con los archivos filtrados por tipo
  getFilesByType(fileType: string): Observable<FileData[]> {
    return this.firestore
      .collection<FileData>('files', ref => ref.where('fileType', '==', fileType))
      .valueChanges();
  }
}

