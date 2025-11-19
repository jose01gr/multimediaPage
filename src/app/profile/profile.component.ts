import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { parsePhoneNumberFromString, isValidPhoneNumber, getCountryCallingCode } from 'libphonenumber-js';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;
  profileForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      gender: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
      streetNumber: [''],
      streetName: [''],
      city: [''],
      state: [''],
      country: [''],
      postcode: [''],
      latitude: [''],
      longitude: [''],
      timezoneOffset: [''],
      timezoneDescription: [''],
      email: ['', [Validators.required, Validators.email]],
      phonePrefix: [{ value: '', disabled: true }],
      phone: ['', [Validators.required, this.phoneValidator]],
      cell: [''],
      username: [''],
      dob: [''],
      age: [''],
      nat: [''],  // Añadir este campo
      picture: [''],
      registrationDate: ['']
    });
  }

  ngOnInit(): void {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.user = user;
        this.loadProfileData();
      } else {
        this.router.navigate(['/login']);
      }
    });

    this.initializeMap();
  }

  async loadProfileData() {
    const profileRef = this.firestore.collection('users').doc(this.user.uid);
    const doc = await profileRef.get().toPromise();

    if (doc && doc.exists) {
      const data = doc.data() || {};
      this.profileForm.patchValue(data);
    } else {
      this.profileForm.patchValue({
        email: this.user.email,
        registrationDate: new Date().toISOString().split('T')[0]
      });
    }
  }

  async saveProfileData() {
    if (this.profileForm.valid) {
      const profileRef = this.firestore.collection('users').doc(this.user.uid);
      await profileRef.set(this.profileForm.value);
      alert('Profile updated successfully!');
    } else {
      alert('Please fill all required fields correctly.');
    }
  }

  onDobChange(event: any) {
    const dob = new Date(event.target.value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      this.profileForm.patchValue({ age: age - 1 });
    } else {
      this.profileForm.patchValue({ age: age });
    }
  }

  initializeMap() {
    const map = L.map('map').setView([37.0902, -95.7129], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    const markerIcon = L.icon({
      iconUrl: 'assets/ubi.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    const marker = L.marker([37.0902, -95.7129], {
      icon: markerIcon,
      draggable: true
    }).addTo(map);

    marker.on('dragend', (e) => {
      const lat = e.target.getLatLng().lat;
      const lng = e.target.getLatLng().lng;
      this.profileForm.patchValue({
        latitude: lat.toFixed(4),
        longitude: lng.toFixed(4)
      });

      this.updateLocationInfo(lat, lng);
    });
  }

  async updateLocationInfo(lat: number, lng: number) {
    // Realizar la solicitud a Nominatim para obtener la información de la ubicación
    const nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    const data = await nominatimResponse.json();
    const address = data.address;
  
    // Obtener el código de país
    const countryCode = address.country_code ? address.country_code.toUpperCase() : '';
  
    // Verificar que se tiene el código de país
    console.log('Código del país:', countryCode);
  
    // Obtener el nombre del país y gentilicio desde la API de restcountries
    if (countryCode) {
      const countryInfoResponse = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      const countryInfo = await countryInfoResponse.json();
  
      console.log('Respuesta de restcountries:', countryInfo);  // Agregar esta línea para ver la estructura
  
      // Asegurarse de que 'demonyms.eng' está presente y correcto
      const countryName = countryInfo[0]?.name?.common || address.country;  // Nombre del país
      const demonym = countryInfo[0]?.demonyms?.eng?.m || 'Desconocido';  // Gentilicio del país en inglés (eng)
  
      console.log('Gentilicio encontrado:', demonym);  // Ver el gentilicio
  
      // Actualizar los campos del formulario con los datos obtenidos
      this.profileForm.patchValue({
        streetNumber: address.house_number || 'Sin número',
        streetName: address.road || 'Sin calle',
        city: address.city || address.town || address.village || 'Sin ciudad',
        state: address.state || 'Sin estado',
        country: countryName || 'Sin país',  // Aquí se llena el campo de país
        postcode: address.postcode || 'Sin código postal',
        nat: demonym || ''  // Aquí se llena el campo de nacionalidad con el gentilicio
      });
  
      // Obtener el código de llamada
      const callingCode = getCountryCallingCode(countryCode);
      this.profileForm.patchValue({
        phonePrefix: `+${callingCode}`  // Actualiza el prefijo telefónico
      });
    }
  
    // Obtener la zona horaria con la API de TimeZoneDB
    const timezoneResponse = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=611YP7FF920L&format=json&by=position&lat=${lat}&lng=${lng}`);
    const timezoneData = await timezoneResponse.json();
  
    // Actualizar la zona horaria en el formulario
    if (timezoneData.status === 'OK') {
      this.profileForm.patchValue({
        timezoneOffset: (timezoneData.gmtOffset / 3600).toFixed(2),
        timezoneDescription: timezoneData.zoneName || 'Zona horaria no disponible'
      });
    } else {
      console.error('Error al obtener la zona horaria:', timezoneData);
      this.profileForm.patchValue({
        timezoneOffset: 'Desconocido',
        timezoneDescription: 'Zona horaria no disponible'
      });
    }
  }
  
  
  

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileForm.patchValue({ picture: e.target.result });
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  phoneValidator(control: any) {
    const value = control.value;
    if (!value) {
      return null;
    }
    const phoneNumber = parsePhoneNumberFromString(value);
    if (!phoneNumber || !isValidPhoneNumber(value)) {
      return { invalidPhone: true };
    }
    return null;
  }
}
