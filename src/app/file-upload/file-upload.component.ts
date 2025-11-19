import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HeaderAdminComponent } from '../header-admin/header-admin.component';

interface FileData {
  fileName: string;
  fileUrl: string;
  fileType: string;
  audioType?: string;
  textContent?: string;
  size?: number; // tamaño en bytes
  width?: number; // ancho en píxeles (para imágenes y videos)
  height?: number;
  duration?: number; // altura en píxeles (para imágenes y videos)
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule, HeaderAdminComponent]
})
export class FileUploadComponent implements OnInit {
  fileType: string = 'audio';
  audioType: string = 'transition1';
  editorContent: string = '';
  wysiwygText: string = '';
  audioFiles: { [key: string]: FileData[] } = { transition1: [], transition2: [], transition3: [] };
  imageFiles: FileData[] = [];
  videoFiles: FileData[] = [];
  uploadSuccess: boolean = false;
  pdfFiles: FileData[] = [];
  subtitleFiles: FileData[] = [];
  allFiles: FileData[] = [];
  subtitles: (FileData & { safeUrl: SafeResourceUrl })[] = [];
  estilos: any;

  editorConfig = {
    theme: 'snow',
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  constructor(
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadFilesFromFirestore();
    this.loadWysiwygContent();
    this.loadEstilos();
    this.loadSubtitles();
  }

  loadWysiwygContent() {
    this.firestore.collection('files', ref => ref.where('fileType', '==', 'wysiwyg').limit(1))
      .get()
      .subscribe(snapshot => {
        if (!snapshot.empty) {
          const fileData = snapshot.docs[0].data() as FileData;
          this.editorContent = fileData.textContent || '';
          this.wysiwygText = fileData.textContent || '';
        }
      });
  }

  saveFiles() {
    if (this.fileType === 'wysiwyg') {
      const fileData: FileData = {
        fileName: 'terms_and_conditions.html',
        fileUrl: '',
        fileType: 'wysiwyg',
        textContent: this.editorContent
      };

      this.firestore.collection('files').add(fileData).then(() => {
        this.uploadSuccess = true;
        this.wysiwygText = this.editorContent;
        setTimeout(() => this.uploadSuccess = false, 3000);
      });
    } else {
      // Implementa la lógica de guardar otros tipos de archivos aquí
      console.log('Guardando otros tipos de archivos...');
    }
  }

  loadFilesFromFirestore() {
    this.firestore.collection('files').snapshotChanges().subscribe(snapshot => {
      snapshot.forEach(doc => {
        const fileData = doc.payload.doc.data() as FileData;
        if (fileData.fileType === 'audio' && !this.audioFiles[fileData.audioType || 'transition1'].some(file => file.fileName === fileData.fileName)) {
          this.audioFiles[fileData.audioType || 'transition1'].push(fileData);
        } else if (fileData.fileType === 'image' && !this.imageFiles.some(file => file.fileName === fileData.fileName)) {
          this.imageFiles.push(fileData);
        } else if (fileData.fileType === 'video' && !this.videoFiles.some(file => file.fileName === fileData.fileName)) {
          this.videoFiles.push(fileData);
        } else if (fileData.fileType === 'pdf' && !this.pdfFiles.some(file => file.fileName === fileData.fileName)) {
          this.pdfFiles.push(fileData);
        } else if (fileData.fileType === 'subtitles' && !this.subtitleFiles.some(file => file.fileName === fileData.fileName)) {
          this.subtitleFiles.push(fileData);
        } else if (fileData.fileType === 'wysiwyg' && !this.allFiles.some(file => file.fileName === fileData.fileName)) {
          this.allFiles.push(fileData);
        }
      });
    });
  }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    const fileType = this.fileType;

    if (file) {
      // Validación específica para archivos de subtítulos
      if (fileType === 'subtitles') {
        // Verificar la extensión del archivo
        if (!file.name.toLowerCase().endsWith('.vtt') && !file.name.toLowerCase().endsWith('.srt')) {
          alert('El archivo de subtítulos debe estar en formato .vtt o .srt');
          return;
        }

        // Convertir a VTT si es necesario (si es SRT)
        if (file.name.toLowerCase().endsWith('.srt')) {
          // Aquí podrías agregar lógica para convertir SRT a VTT si es necesario
          console.log('Se recomienda usar formato VTT para los subtítulos');
        }
      }

      const filePath = `${fileType}/${new Date().getTime()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            // Para subtítulos, guardamos directamente sin procesamiento adicional
            if (fileType === 'subtitles') {
              const fileData: FileData = {
                fileName: file.name,
                fileUrl: url,
                fileType: 'subtitles',
                size: file.size
              };

              // Guardar en Firestore
              this.firestore.collection('files').add(fileData).then(() => {
                console.log('Subtítulos guardados correctamente');
                this.uploadSuccess = true;
                setTimeout(() => this.uploadSuccess = false, 3000);
              }).catch(error => {
                console.error('Error al guardar los subtítulos:', error);
              });
            } else {
              // Validations for audio files
              if (fileType === 'audio') {
                const requiredAudioTypes = ['transition1', 'transition2', 'transition3'];
                const missingTypes = requiredAudioTypes.filter(type => this.audioFiles[type].length === 0);

        if (this.audioFiles[this.audioType].length > 0) {
          alert(`You must delete the existing audio file for ${this.audioType} before uploading a new one.`);
          return;
        }
      }

      // Validations for subtitle files
      if (fileType === 'subtitles' && this.subtitleFiles.length > 0) {
        alert('You must delete the existing subtitle file before uploading a new one.');
        return;
      }

      // Validations for video files
      if (fileType === 'video' && this.videoFiles.length > 0) {
        alert('You must delete the existing video file before uploading a new one.');
        return;
      }

      // Validations for PDF files
      if (fileType === 'pdf' && this.pdfFiles.length > 0) {
        alert('You must delete the existing PDF file before uploading a new one.');
        return;
      }

      // Validations for WYSIWYG content
      if (fileType === 'wysiwyg' && this.allFiles.some(f => f.fileType === 'wysiwyg')) {
        alert('You must delete the existing WYSIWYG content before uploading a new one.');
        return;
      }

      // Validations for image files
      if (fileType === 'image') {
        if (this.imageFiles.length === 0) {
          alert('You must upload at least one image.');
        } else if (this.imageFiles.length >= 100) {
          alert('You can upload a maximum of 3 images. Please delete an existing image before uploading a new one.');
          return;
        }
      }

              if (fileType === 'image' || fileType === 'video') {
                const fileReader = new FileReader();
                fileReader.onload = (e: any) => {
                  if (fileType === 'image') {
                    const img = new Image();
                    img.onload = () => {
                      const width = img.width;
                      const height = img.height;
                      this.saveFileData(file, fileType, url, file.size, width, height);
                    };
                    img.src = e.target.result;
                  } else if (fileType === 'video') {
                    const video = document.createElement('video');
                    video.onloadedmetadata = () => {
                      const width = video.videoWidth;
                      const height = video.videoHeight;
                      const duration = video.duration;
                      this.saveFileData(file, fileType, url, file.size, width, height, duration);
                    };
                    video.src = URL.createObjectURL(file);
                  }
                };
                fileReader.readAsDataURL(file);
              } else {
                this.saveFileData(file, fileType, url, file.size);
              }
              this.uploadSuccess = true;
              setTimeout(() => this.uploadSuccess = false, 3000);
            }
          });
        })
      ).subscribe();
    }
  }

  saveFileData(file: any, fileType: string, fileUrl: string, fileSize: number, width?: number, height?: number, duration?: number) {
    // Crear un objeto de datos básico para todos los archivos
    const fileData: FileData = {
      fileName: file.name,
      fileUrl: fileUrl,
      fileType: fileType,
      size: fileSize,
    };

    // Solo agregar estos campos si tienen un valor definido y si son relevantes para el tipo de archivo
    if ((fileType === 'image' || fileType === 'video') && width !== undefined && height !== undefined) {
      // Se agregan width y height tanto para imágenes como para videos
      fileData.width = width;
      fileData.height = height;
    }

    if ((fileType === 'audio' || fileType === 'video') && duration !== undefined) {
      // Solo se agrega duration para archivos de tipo audio o video
      fileData.duration = duration;
    }

    // Aquí mantenemos la lógica para agregar el archivo a los arrays locales antes de guardarlo en Firestore
    if (fileType === 'audio' && !this.audioFiles[this.audioType].some(f => f.fileName === fileData.fileName)) {
      this.audioFiles[this.audioType].push(fileData);
    } else if (fileType === 'image' && !this.imageFiles.some(f => f.fileName === fileData.fileName)) {
      this.imageFiles.push(fileData);
    } else if (fileType === 'video' && !this.videoFiles.some(f => f.fileName === fileData.fileName)) {
      this.videoFiles.push(fileData);
    } else if (fileType === 'pdf' && !this.pdfFiles.some(f => f.fileName === fileData.fileName)) {
      this.pdfFiles.push(fileData);
    } else if (fileType === 'subtitles' && !this.subtitleFiles.some(f => f.fileName === fileData.fileName)) {
      this.subtitleFiles.push(fileData);
    } else if (fileType === 'wysiwyg' && !this.allFiles.some(f => f.fileName === fileData.fileName)) {
      this.allFiles.push(fileData);
    }

    // Ahora agregamos el archivo a Firestore
    this.firestore.collection('files').add(fileData).then(() => {
      console.log('Archivo guardado correctamente en Firestore');
    }).catch(error => {
      console.error('Error guardando el archivo en Firestore:', error);
    });
  }



  removeFile(file: FileData, fileType: string, audioType?: string) {
    if (fileType === 'wysiwyg') {
      // For WYSIWYG, we'll clear the content and remove it from Firestore
      this.wysiwygText = '';
      this.firestore.collection('files').ref.where('fileType', '==', 'wysiwyg').get().then(snapshot => {
        snapshot.forEach(doc => doc.ref.delete());
      });
    } else {
      const fileRef = this.storage.refFromURL(file.fileUrl);
      fileRef.delete().subscribe(() => {
        this.firestore.collection('files').ref.where('fileName', '==', file.fileName).get().then(snapshot => {
          snapshot.forEach(doc => doc.ref.delete());
        });

        if (fileType === 'audio' && audioType) {
          this.audioFiles[audioType] = this.audioFiles[audioType].filter(f => f.fileName !== file.fileName);
        } else if (fileType === 'image') {
          this.imageFiles = this.imageFiles.filter(f => f.fileName !== file.fileName);
        } else if (fileType === 'video') {
          this.videoFiles = this.videoFiles.filter(f => f.fileName !== file.fileName);
        } else if (fileType === 'pdf') {
          this.pdfFiles = this.pdfFiles.filter(f => f.fileName !== file.fileName);
        } else if (fileType === 'subtitles') {
          this.subtitleFiles = this.subtitleFiles.filter(f => f.fileName !== file.fileName);
        }
      });
    }
  }

  updateFileType(event: any) {
    this.fileType = event.target.value;
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  loadSubtitles(): void {
    this.firestore.collection('files')
      .ref.where('fileType', '==', 'subtitles')
      .get()
      .then(snapshot => {
        this.subtitles = snapshot.docs.map(doc => {
          const data = doc.data() as FileData;
          return {
            ...data,
            safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(data.fileUrl)
          };
        });
      });
  }

  loadEstilos(): void {
    this.firestore
      .collection('configuracion')
      .doc('estilos')
      .valueChanges()
      .subscribe((data: any) => {
        if (data) {
          this.estilos = data;
          this.aplicarEstilos(data);
        }
      });
  }

  private aplicarEstilos(estilos: any): void {
    const root = document.documentElement;
    root.style.setProperty('--color-fondo', estilos.colorFondo);
    root.style.setProperty('--color-texto', estilos.colorTexto);
    root.style.setProperty('--color-primario', estilos.colorPrimario);
    root.style.setProperty('--color-secundario', estilos.colorSecundario);
    root.style.setProperty('--tamano-titulo', `${estilos.tamanoTitulo}em`);
    root.style.setProperty('--tamano-subtitulo', `${estilos.tamanoSubtitulo}em`);
    root.style.setProperty('--tamano-parrafo', `${estilos.tamanoParrafo}em`);
    root.style.setProperty('--fuente-principal', estilos.fuentePrincipal || 'Arial, sans-serif');
    root.style.setProperty('--fuente-secundaria', estilos.fuenteSecundaria || 'Georgia, serif');
  }
}
