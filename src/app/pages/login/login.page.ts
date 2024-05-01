import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { NetworkService } from 'src/app/services/network.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  showPassword: boolean = false;
  isOnline: any;
  
  networkSubscription!: Subscription;

  constructor(private loginService: LoginService, private networkService: NetworkService, private uiService: UiService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl(null, { validators: [Validators.required] }),
      password: new FormControl(null, { validators: [Validators.required] }),
    });
    this.networkSubscription = this.networkService.isNetworkAvailable().subscribe((networkStatus) => {
      this.isOnline = networkStatus
    })  }

    async login() {
      if (this.isOnline) {
        const username = this.loginForm.value.username;
        const password = this.loginForm.value.password;
        if (username && username.trim() !== '' && password && password.trim() !== '') {
          this.uiService.getCustomLoader('Please wait');
          this.loginService.login(username, password);
        } else {
          this.uiService.presentToast('', 'Please enter both username and password');
        }
      } else {
        try {
          this.uiService.presentToast('Error', 'No Internet Connection');
        } catch (error) {
          this.uiService.presentToast('Error', 'Failed to get network status');
        }
      }
    }

}


