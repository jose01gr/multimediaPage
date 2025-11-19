import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FileService, FileData } from '../file.service'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './header-admin.component.html',
  styleUrl: './header-admin.component.css'
})
export class HeaderAdminComponent {
  pdfFiles: FileData[] = [];
  constructor(private fileService: FileService, private router: Router) {}

  ngOnInit(): void {
    this.fileService.getFilesByType('pdf').subscribe(files => {
      console.log(files);  // Para asegurarte de que los archivos pdf también se están cargando
      this.pdfFiles = files;
    });
  }

  goToFile() {
    this.router.navigate(['/file-upload']);
  }
  goToConfiguracion() {
    this.router.navigate(['/admin']);
  }
  goToHome() {
    this.router.navigate(['/landing-page']);
  }

}
