import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';  // Asegúrate de importar FormsModule
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';  // Para usar formularios reactivos
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'; 

import { CommonModule } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular'; 
import { QuillModule } from 'ngx-quill';  // Importar el módulo Quill

// Componentes
import { LoginComponent } from './login/login.component'; 
import { ProfileComponent } from './profile/profile.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { TerminosComponent } from './terminos/terminos.component';


// Firebase Modules
import { AngularFireModule } from '@angular/fire/compat';  // Para integrar Firebase
import { AngularFireAuthModule } from '@angular/fire/compat/auth';  // Para autenticación
import { environment } from '../environments/environment';
import { AngularFireStorageModule } from '@angular/fire/compat/storage'; 
import { AdminComponent } from './admin/admin.component';  // Tu configuración de Firebase
import { HeaderAdminComponent } from './header-admin/header-admin.component';


@NgModule({
  declarations: [
    AppComponent,   // Declara el LoginComponent aquí
    ProfileComponent,
    
    
    

    
    
  
    
    
     // Declara el ProfileComponent aquí
  ],
  imports: [
    LoginComponent,
    CommonModule,
    BrowserModule,
    AppRoutingModule,  // Importa el AppRoutingModule para el enrutamiento
    ReactiveFormsModule,
    FormsModule,  // Importa FormsModule para usar ngModel en formularios
    AngularFireModule.initializeApp(environment.firebaseConfig),  // Inicializa Firebase
    AngularFireAuthModule,
    AngularFirestoreModule,  // Módulo de autenticación de Firebase
    FileUploadComponent,
    AngularFireStorageModule,
    CKEditorModule,
    TerminosComponent,
    AdminComponent ,
    HeaderAdminComponent,
    QuillModule.forRoot({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'image'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'font': [] }],
          [{ 'align': [] }],
          ['clean']
        ]
      }
    })

    
    
  ],
  providers: [],
  bootstrap: [AppComponent]  // El componente raíz que se carga primero
})
export class AppModule { }

