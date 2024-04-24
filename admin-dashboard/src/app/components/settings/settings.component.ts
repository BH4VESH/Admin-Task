import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SettingService } from '../../services/setting.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  secondsOptions: number[] = [10, 20, 30, 45, 60, 90, 120];
  stopOptions: number[] = [1, 2, 3, 4, 5];
 
  constructor(private _AuthService:AuthService,
    private SettingService:SettingService,
    private authService:AuthService
  ){}
  adminId:any
  selectedSeconds!: number;
  selectedStopCount!: number;
  
  ngOnInit(): void {
    this.getSetting()
  }
  saveSetting(): void {
    this.SettingService.saveSetting(this.selectedSeconds, this.selectedStopCount)
      .subscribe(
        (response) => {
          console.log('Setting saved successfully', response);
        },
        (error) => {
          console.error('Error saving setting', error);
        }
      );
  }
  getSetting(){
    this.SettingService.getSetting().subscribe((response)=>{
      if (response) {
        this.selectedSeconds=response[0].selectedSeconds;
        this.selectedStopCount=response[0].selectedStopCount
      }
    })
  }
}
