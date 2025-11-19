import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


// Importar los componentes que estarán en las rutas
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { ProfileComponent } from './profile/profile.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { TerminosComponent } from './terminos/terminos.component'; 
import { HeaderAdminComponent } from './header-admin/header-admin.component';

// Definir las rutas
const routes: Routes = [
  { path: '', redirectTo: '/landing-page', pathMatch: 'full'  },  // Redirigir a /login si el path está vacío
  { path: 'login', component: LoginComponent },  // Ruta para la página de login
  { path: 'admin', component: AdminComponent},
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'profile', component: ProfileComponent }, // Ruta para la página de perfil
  { path: 'file-upload', component: FileUploadComponent },
  { path: 'header-admin', component: HeaderAdminComponent},
  { path: 'terminos', component: TerminosComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],  // Configuración del enrutador raíz
  exports: [RouterModule]
})
export class AppRoutingModule { }
