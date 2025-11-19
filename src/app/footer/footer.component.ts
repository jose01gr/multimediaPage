import { Component, OnInit } from '@angular/core';
import { FileService, FileData } from '../file.service'; 
import { TangramComponent } from '../tangram/tangram.component'; // Importa el servicio
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [TangramComponent, CommonModule]
})
export class FooterComponent {
  constructor(private router: Router) {}

  
  goToTerminos() {
    this.router.navigate(['/terminos']);
  }
}
