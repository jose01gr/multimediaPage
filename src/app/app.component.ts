import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  defaultEstilos = {
    colorFondo: '#ffffff',
    colorTexto: '#000000',
    colorTitulo: '#333333',
    colorSubtitulo: '#555555',
    tamanoTitulo: 2,
    tamanoSubtitulo: 1.5,
    tamanoParrafo: 1,
  };

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.cargarEstilos();
  }

  cargarEstilos(): void {
    this.firestore.collection('configuracion').doc('estilos').valueChanges().subscribe((data: any) => {
      const estilos = data || this.defaultEstilos;
      document.documentElement.style.setProperty('--color-fondo', estilos.colorFondo);
      document.documentElement.style.setProperty('--color-texto', estilos.colorTexto);
      document.documentElement.style.setProperty('--color-titulo', estilos.colorTitulo);
      document.documentElement.style.setProperty('--color-subtitulo', estilos.colorSubtitulo);
      document.documentElement.style.setProperty('--tamano-titulo', estilos.tamanoTitulo + 'em');
      document.documentElement.style.setProperty('--tamano-subtitulo', estilos.tamanoSubtitulo + 'em');
      document.documentElement.style.setProperty('--tamano-parrafo', estilos.tamanoParrafo + 'em');
    });
  }
}


