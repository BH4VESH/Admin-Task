import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { RideHistoryService } from '../../services/ride-history.service';
import { ToastrService } from 'ngx-toastr';
import { VehicleService } from '../../services/vehicle.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DurationConvertPipe } from '../../pipes/duration-convert.pipe';
import { SocketService } from '../../services/socket.service';

declare const google: any;

@Component({
  selector: 'app-ride-history',
  standalone: true,
  imports: [CommonModule,MatPaginatorModule, FormsModule, DurationConvertPipe],
  templateUrl: './ride-history.component.html',
  styleUrl: './ride-history.component.css'
})
export class RideHistoryComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLElement>;

  search: string = '';
  statusSearch: number=-1 
  vehicleSearch: string = '';
  searchText: any
  searchDate: any 

  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 3;

  allRideList:any[]=[]
  vehicleList:any[]=[]
  // messageInput: any;
  map!: google.maps.Map;
  public geocoder!: google.maps.Geocoder;
  private polyline!: google.maps.Polyline;
 
  constructor(
    private RideHistoryService:RideHistoryService,
    private ToastrService:ToastrService,
    private VehicleService:VehicleService,
    private SocketService:SocketService,
    
  ){
    
  }
  
  ngOnInit(): void {
    this.fetchRideList()
    this.getVehicle()
    this.deletLisn()
    this.ridestatusupates()
    this.initMap();
  }



  fetchRideList(): void {
    this.RideHistoryService.getRideList(this.currentPage, this.itemsPerPage).subscribe(
      (response: any) => {
        if (response.success) {
          this.allRideList = response.rideList;
          this.totalItems = response.totalItems;
          console.log("it is all rides : ",response)
          console.log("all ride list :",this.allRideList)
          console.log(this.vehicleList)
        } else {
          this.ToastrService.error('Error fetching ride data:', response.message);
        }
      },
      error => {
        this.ToastrService.warning('No data awailable');
      }
    );
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    
    if (this.search || this.statusSearch !==-1 || this.vehicleSearch!=='' || this.searchDate) {
      console.log("79 line search work")
      this.performSearch()
    } else {
      console.log("else part")
      this.fetchRideList()
    }
    
  }

  getVehicle(){
    this.VehicleService.getAllVehicles().subscribe((responce:any)=>{
      if (responce) {
        this.vehicleList=responce
        console.log(responce,"it is vehicle")
      }
    })
  }

  performSearch() {
    this.RideHistoryService.searchRides(this.statusSearch,this.vehicleSearch,this.searchText,this.searchDate,this.currentPage,this.itemsPerPage).subscribe((result) => {
      // Handle the search result here
      // this.allRideList=[]
      this.allRideList=result.result
      this.totalItems=result.totalItems
      console.log('Search Result:', result);
    });
  }

  clearFields() {
    this.statusSearch = -1;
    this.vehicleSearch = '';
    this.searchText = '';
    this.searchDate = '';
    this.fetchRideList()
  }

  getUserPic(iconName: string): string {
    return `http://localhost:3000/uploads/userProfilePic/${iconName}`;
  }
  getServiceIcon(iconName: string): string {
    return `http://localhost:3000/uploads/icons/${iconName}`;
  }
  getDriverPic(iconName: string): string {
    return `http://localhost:3000/uploads/driver_list_profile/${iconName}`;
  }

  // socket live listening
  deletLisn(){ 
    this.SocketService.listencancelride().subscribe((ridedata: any) => {
      // this.ToastrService.warning(ridedata.message)
      this.fetchRideList()
    })
  }
   // -----------------accept btn listning
   ridestatusupates() {
    this.SocketService.listeningrideupdates().subscribe((res: any) => {
      // console.log("compaleeeeeeeeeeee",res.ridestatus)
      this.fetchRideList()
    } );
  }


  // info
  infoData: any[] = [];

  rideInfo(ride: any) {
    // console.log(rideId);

    this.infoData = [ride]
    console.log(this.infoData[0].fromLocation)
    console.log(this.infoData[0].toLocation)

    this.drawPath(this.infoData[0].fromLocation, this.infoData[0].toLocation,this.infoData[0].stopValue);

    console.log(this.infoData[0].stopValue);
  }

  // map load in the info dilog

  initMap(): void {
    navigator.geolocation.getCurrentPosition((location) => {
      let coordinates = location.coords;
      const myplace = { lat: coordinates.latitude, lng: coordinates.longitude };
      this.map = new google.maps.Map(
        this.mapContainer.nativeElement,
        {
          zoom: 10,
          center: myplace,
        }
      );

      this.geocoder = new google.maps.Geocoder();
      this.polyline = new google.maps.Polyline({
        map: this.map,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });
    });
  }

  // drow path
  drawPath(from: string, to: string, stops: string[]): void {
    this.geocodeAddress(from, (originCoords) => {
      if (!originCoords) {
        console.error('Geocoding origin address failed');
        return;
      }

      this.geocodeAddress(to, (destinationCoords) => {
        if (!destinationCoords) {
          console.error('Geocoding destination address failed');
          return;
        }

        this.geocodeStops(stops, (waypoints) => {
          const path = [originCoords, ...waypoints, destinationCoords];

          this.polyline.setMap(null);
          this.polyline = new google.maps.Polyline({
            path: path,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 4,
          });

          this.polyline.setMap(this.map);
          const bounds = new google.maps.LatLngBounds();
          path.forEach(coords => bounds.extend(coords));
          this.map.fitBounds(bounds);
        });
      });
    });
  }

  geocodeAddress(address: string, callback: (coords: google.maps.LatLng | null) => void): void {
    this.geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results) {
        const coords = results[0].geometry.location;
        callback(coords);
      } else {
        console.error('Geocoding failed:', status);
        callback(null);
      }
    });
  }

  geocodeStops(stops: string[], callback: (waypoints: google.maps.LatLng[]) => void): void {
    const waypoints: google.maps.LatLng[] = [];
    let processedCount = 0;

    if (stops.length === 0) {
      callback(waypoints);
      return;
    }

    stops.forEach(stop => {
      this.geocodeAddress(stop, (coords) => {
        if (coords) {
          waypoints.push(coords);
        }
        processedCount++;
        if (processedCount === stops.length) {
          callback(waypoints);
        }
      });
    });
  }

// downloads-csv
  download(ride: any): void {
    console.log(ride)
    const headers = ['Ride ID','Status', 'Service Name', 'Username', 'Phone', 'Email','FromLocation','ToLocation','Distance(Km)','ScheduledDate','Date','EstimeteFare','Paymentoption','Country Code','City'];
    const fields = ['_id','ridestatus','service.name', 'user.username', 'user.phone', 'user.email','fromLocation','toLocation','totalDistanceKm','scheduledDate','date','estimeteFare','paymentOption','country.country_code','city.name'];
    const csvData = this.convertToCSV([ride], fields, headers);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ride_info_${ride._id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertToCSV(objArray: any[], fields: string[], headers: string[]): string {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let csv = headers.join(',') + '\n';

    for (const item of array) {
        let line = '';
        for (let j = 0; j < fields.length; j++) {
            if (line !== '') line += ',';

            const fieldParts = fields[j].split('.');
            let value = item;
            for (const part of fieldParts) {
                value = value ? value[part] : '';
            }
            if (typeof value === 'string' && value.includes(',')) {
                value = `"${value}"`; 
            }
            line += value;
        }
        csv += line + '\n';
    }

    return csv;
}

}



