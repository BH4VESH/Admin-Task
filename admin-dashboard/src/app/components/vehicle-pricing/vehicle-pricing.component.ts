import { Component, OnInit } from '@angular/core';
import { CountryService } from '../../services/country.service';
import { CommonModule } from '@angular/common';
import { CityService } from '../../services/city.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { VehiclePriceService } from '../../services/vehicle-price.service';
import {VehiclePrice} from '../../models/vihiclePrice';
import {Country} from '../../models/country';
import {Zone} from '../../models/zone';
import {VehicleType} from '../../models/vihicle-type';
import { ToastrService } from 'ngx-toastr';
import { positiveNumberValidator } from '../../validator/positive_number';

@Component({
  selector: 'app-vehicle-pricing',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './vehicle-pricing.component.html',
  styleUrl: './vehicle-pricing.component.css'
})
export class VehiclePricingComponent implements OnInit{
  vehicleForm: FormGroup;
  countryId!:string;
  cityId!:string;
  vehicleId!:string;
  countries: Country[] = []; 
  cities: Zone[] = []; 
  vehicles: VehicleType[] = []; 
  city: Zone[] = []; 


  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private CityService:CityService,
    private VehicleService:VehicleService,
    private VehiclePriceService:VehiclePriceService,
    private ToastrService:ToastrService) {
      this.vehicleForm = this.fb.group({
      selectedCountryId: [null, Validators.required],
      selectedCityId: [null, Validators.required],
      selectedVehicleId: [null, Validators.required],
      Driver_Profit: [null, [Validators.required,positiveNumberValidator()]],
      min_fare: [null, [Validators.required,positiveNumberValidator()]],
      Distance_for_base_price: [null, [Validators.required,positiveNumberValidator()]],
      Base_price: [null,[Validators.required,positiveNumberValidator()]],
      Price_per_Unit_Distance: [null,[Validators.required,positiveNumberValidator()]],
      Price_per_Unit_time: [null,[Validators.required,positiveNumberValidator()]],
      Max_space: [null,[Validators.required,positiveNumberValidator()]]
      });
     }
  
  ngOnInit(): void {
    this.fetchCountries(); 
    this.fetchCities();
    
  }

  fetchCountries(): void {
    this.countryService.fatchCountry().subscribe((countries:Country[]) => {
      this.countries = countries; 
     
    });
  }

  fetchCities(): void {
    this.CityService.getAllZone().subscribe((cities:Zone[]) => {
      this.cities = cities; 
      this.fetchVehicles()
      
    });
  }
  fetchVehicles(): void {
    this.VehicleService.getAllVehicles().subscribe((vehicles:VehicleType[]) => {
      this.vehicles = vehicles; 
    }); 
  }

  onChangeCountry(event: any): void {
    const selectedCountryId = event.target.value;
    console.log(selectedCountryId);
    this.countryId=selectedCountryId
    this.city = this.cities.filter(city => city.country_id === selectedCountryId);
  }
  onChangeCity(event: any): void {
    const selectedCityId=event.target.value;
    this.cityId=selectedCityId  
    console.log("Selected City ID:", selectedCityId);
  }
  onChangeVehicle(event: any): void {
    const selectedVehicleId=event.target.value;
    this.vehicleId=selectedVehicleId  
    console.log("Selected vehecle ID:", selectedVehicleId);
  } 
  sendDataToServer(): void {
    // console.log("valid:",this.vehicleForm.valid)
    if (this.vehicleForm.valid) {
      const data = {
        countryId: this.countryId,
        cityId: this.cityId,
        vehicleId: this.vehicleId,
        Driver_Profit: this.vehicleForm.value.Driver_Profit,
        min_fare: this.vehicleForm.value.min_fare,
        Distance_for_base_price: this.vehicleForm.value.Distance_for_base_price,
        Base_price: this.vehicleForm.value.Base_price,
        Price_per_Unit_Distance: this.vehicleForm.value.Price_per_Unit_Distance,
        Price_per_Unit_time: this.vehicleForm.value.Price_per_Unit_time,
        Max_space: this.vehicleForm.value.Max_space
      };

      this.VehiclePriceService.sendData(data).subscribe((response:VehiclePrice) => {
        this.ToastrService.success("Data saved successfully");
        this.emptyAll();
      }, error => {
        console.error('Error sending data:', error);
      });
    } else {
      this.ToastrService.error("Error: All fields are required");
      this.vehicleForm?.markAllAsTouched();
    }
  }

  emptyAll(): void {
    this.vehicleForm?.reset();
  }
}
