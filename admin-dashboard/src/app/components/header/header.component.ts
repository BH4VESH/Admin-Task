import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet,RouterLinkActive } from '@angular/router';
import { BnNgIdleService } from 'bn-ng-idle';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  title = 'admin-dashboard';
  disableLogin: boolean=true
  checkloginbtn:boolean=false

  constructor(private _AuthService: AuthService){}

  logout(): void {
      this._AuthService.logout()
   }
   

  
 
//  session timeout

   ngOnInit(): void {
    // this._AuthService.sessionOut()
    // this.checkloginbtn=this._AuthService.isSession
  
  }

}
