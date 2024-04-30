import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Country } from '../../models/country';
import { CountryService } from '../../services/country.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateRideService } from '../../services/create-ride.service';
import { User } from '../../models/user';
import { SettingService } from '../../services/setting.service';

declare const google: any;

@Component({
  selector: 'app-create-ride',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-ride.component.html',
  styleUrl: './create-ride.component.css'
})
export class CreateRideComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLElement>;
  // fromInput: HTMLInputElement = document.getElementById('from-input') as HTMLInputElement;
  // toInput: HTMLInputElement = document.getElementById('to-input') as HTMLInputElement;
  userPhoneInput: FormGroup;
  countries: Country[] = [];
  users: User[] = [];
  Username: string = '';
  Email: string = '';
  Phone: string = '';
  showUserSection: boolean = false;
  next: boolean = true;
  fromTo: boolean = false
  stopInputs: string[] = [];
  selectedStopCount!: number
  // for the map
  autocompleteService: google.maps.places.AutocompleteService;
  map!: google.maps.Map;
  fromMarker!: google.maps.Marker;
  toMarker!: google.maps.Marker;
  stopsMarkers: google.maps.Marker[] = [];
  path: google.maps.Polyline | undefined;
  directionsRenderer: google.maps.DirectionsRenderer | undefined;
  directionsService!: google.maps.DirectionsService;

  from!: string | undefined;
  to!: string | undefined;
  stop!: string | undefined;
  distance!: string | undefined;
  duration!: string | undefined;

  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private toastrService: ToastrService,
    private CreateRideService: CreateRideService,
    private SettingService: SettingService,
    // private VehicleService: VehicleService,
  ) {
    this.userPhoneInput = this.fb.group({
      countryCode: ['', Validators.required],
      phone: ['', Validators.required],
    });
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.directionsService = new google.maps.DirectionsService();
  }

  ngOnInit(): void {
    this.fetchCountries();
    this.fetchStop();
    this.initMap();
  }

  ngAfterViewInit(): void {
    this.initAutocomplete(this.placeMarker.bind(this));   
  }

  fetchCountries(): void {
    this.countryService.fatchCountry().subscribe(countries => {
      this.countries = countries;
      console.log(countries)
    });
  }
  callingCode(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedCountryId = target.value;
    console.log(selectedCountryId)
  }
  searchUsers(): void {
    const { countryCode, phone } = this.userPhoneInput.value;
    console.log(countryCode, phone)
    if (countryCode && phone) {
      this.CreateRideService.searchUsers(countryCode, phone)
        .subscribe(
          (response: any) => {
            if (response.success) {
              this.users = response.users;
              this.toastrService.success(response.message)
              this.setUserValue()
              this.showUserSection = true
              console.log(this.users)
            } else {
              this.toastrService.error(response.message)
              this.showUserSection = false
              this.Username = '';
              this.Email = '';
              this.Phone = '';
            }
          },
          error => {
            this.toastrService.error("An error occurred while fetching users.")
          }
        );
    } else {
      this.toastrService.error("Please provide both countryId and phone number.")
    }
  }
  setUserValue() {
    this.Username = this.users[0].username;
    this.Email = this.users[0].email;
    this.Phone = this.users[0].phone;
  }
  nextBtn() {
    this.next = false;
    this.fromTo = true
  }
  // fetch stps in the setting service
  fetchStop() {
    this.SettingService.getSetting().subscribe(
      (Response) => {
        this.selectedStopCount = Response[0].selectedStopCount
        console.log(this.selectedStopCount)
      }
    )
  }
  addStopInput() {
    if (this.stopInputs.length < this.selectedStopCount) {
      this.stopInputs.push('');
      setTimeout(() => {
        this.initAutocomplete(this.placeMarker.bind(this))
      });
      // this.initAutocomplete();
    }
  }
  removeStopInput(index: number): void {
    if (index >= 0 && index < this.stopInputs.length) {
      // Remove the stop from the inputs array
      this.stopInputs.splice(index, 1);
  
      // Remove the stop marker from the map
      if (this.stopsMarkers[index]) {
        this.stopsMarkers[index].setMap(null);
        this.stopsMarkers.splice(index, 1);
      }
      // Redraw the path with the updated stops
      this.drawPath();
      this.calculateDistance()
    }
  }

  logAllValues(): void {
    console.log('From:', (document.getElementById('from-input') as HTMLInputElement).value);
    console.log('To:', (document.getElementById('to-input') as HTMLInputElement).value);
    this.stopInputs.forEach((value, index) => {
      console.log(`Stop ${index + 1}:`, value);
    });
    console.log(this.stopsMarkers)
  }

  trackByFn(index: number, item: any): number {
    return index;
  }

  // for the map
  initMap(): void {
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 22.2598107, lng: 70.7287299 },
      zoom: 10,

    };

    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
  }


  initAutocomplete(placeMarker: (place: google.maps.places.PlaceResult, type: 'from' | 'to' | 'stop') => void) {
    const fromInput: HTMLInputElement = document.getElementById('from-input') as HTMLInputElement;
    const toInput: HTMLInputElement = document.getElementById('to-input') as HTMLInputElement;

    const fromAutocomplete = new google.maps.places.Autocomplete(fromInput);
    const toAutocomplete = new google.maps.places.Autocomplete(toInput);

    fromAutocomplete.addListener('place_changed', () => {
      const place = fromAutocomplete.getPlace();
      placeMarker(place, 'from');
    });

    toAutocomplete.addListener('place_changed', () => {
      const place = toAutocomplete.getPlace();
      placeMarker(place, 'to');
    });

    this.stopInputs.forEach((_, index) => {
      const stopInput: HTMLInputElement = document.getElementById(`stop-input-${index}`) as HTMLInputElement;
      const autocomplete = new google.maps.places.Autocomplete(stopInput);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        placeMarker(place, 'stop');
      });
    });
  }


  placeMarker(place: google.maps.places.PlaceResult, type: 'from' | 'to' | 'stop'): void {
    if (!place || !place.geometry || !place.geometry.location) {
      this.toastrService.error('Please select a valid location.');
      return;
    }
  
    let iconUrl;
    if (type === 'from') {
      iconUrl = 'https://maps.google.com/mapfiles/kml/paddle/blu-circle.png';
      this.from = place.name || '';
      if (this.fromMarker) {
        this.fromMarker.setMap(null);
      }
    } else if (type === 'to') {
      iconUrl = 'https://maps.google.com/mapfiles/kml/paddle/grn-circle.png';
      this.to = place.name || '';
      if (this.toMarker) {
        this.toMarker.setMap(null); 
      }
    } else {
      iconUrl = 'https://maps.google.com/mapfiles/kml/paddle/wht-circle.png';
      // this.stopsMarkers.forEach(marker => marker.setMap(null)); // Remove existing stop markers
      // this.stopsMarkers = [];
      // const marker = new google.maps.Marker({
      //   position: place.geometry.location,
      //   map: this.map,
      //   title: place.name || '',
      //   icon: {
      //     url: iconUrl,
      //     scaledSize: new google.maps.Size(50, 50)
      //   }
      // });
      // this.stopsMarkers.push(marker);
    }
  
    const marker = new google.maps.Marker({
      position: place.geometry.location,
      map: this.map,
      title: place.name || '',
      icon: {
        url: iconUrl,
        scaledSize: new google.maps.Size(50, 50)
      }
    });
  
    if (type === 'from') {
      this.fromMarker = marker;
    } else if (type === 'to') {
      this.toMarker = marker;
    }else{
      this.stopsMarkers.push(marker)
      console.log(this.stopsMarkers)
    }
  
    if (this.from && this.to) {
      this.calculateDistance();
      this.drawPath();
    }
  
    this.map.setCenter(place.geometry.location);
  }

  // palce marker over
  ///////////////////////////////////////////////////////////////////////////

  calculateDistance(): void {
    const service = new google.maps.DistanceMatrixService();
    const data = {
      origins: [this.from],
      destinations: [this.to],
      travelMode: 'DRIVING'
    }
    service.getDistanceMatrix(data
      ,
      (response: google.maps.DistanceMatrixResponse, status: google.maps.DistanceMatrixStatus) => {
        if (status === 'OK' && response.rows.length > 0 && response.rows[0].elements.length > 0) {
          this.distance = response.rows[0].elements[0].distance.text;
          this.duration = response.rows[0].elements[0].duration.text;
          console.log(this.distance)
          console.log(this.duration)

        } else {
          console.error('Error calculating distance:', status);
        }
      }
    );
  }

  //////////////////////////////////////////////////////////////////////////////////

  drawPath(): void {
    const waypoints = this.stopsMarkers.map(marker => ({
      location: marker.getPosition()!,
      stopover: true
    }));
  
    const request = {
      origin: this.fromMarker.getPosition()!,
      destination: this.toMarker?.getPosition()!,
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING
    };
  
    this.directionsService.route(request, (response, status: google.maps.DirectionsStatus) => {
      if (status === google.maps.DirectionsStatus.OK) {
        if (this.directionsRenderer) {
          this.directionsRenderer.setMap(null);
        }
        this.directionsRenderer = new google.maps.DirectionsRenderer({
          map: this.map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#FF0000',
            strokeOpacity: 2.0,
            strokeWeight: 4
          }
        });
        this.directionsRenderer!.setDirections(response);
      } else {
        console.error('Error calculating distance:', status);
      }
    });
  }
}