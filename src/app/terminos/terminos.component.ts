import { Component, OnInit } from '@angular/core';
import { FileService, FileData } from '../file.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, QuillModule],
  templateUrl: './terminos.component.html',
  styleUrls: ['./terminos.component.css']
})
export class TerminosComponent implements OnInit {
  wysiwygFiles: FileData[] = [];

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.fileService.getFilesByType('wysiwyg').subscribe(files => {
      this.wysiwygFiles = files;
    });
  }
}
