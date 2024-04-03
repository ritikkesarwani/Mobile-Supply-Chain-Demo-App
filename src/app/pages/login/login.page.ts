import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { NodeApiService } from 'src/app/services/node-api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  showPassword: boolean = false;

  constructor(
    private toastController: ToastController,
    private nodeApiService: NodeApiService
    ) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl(null, { validators: [Validators.required] }),
      password: new FormControl(null, { validators: [Validators.required] }),
    })
  }

  async login(){
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;
    if (!username || username.trim() === '') {
      const toast = await this.toastController.create({
        header: 'Error',
        message: "Please enter username",
        duration: 1500,
        
      });
      await toast.present();
      return;
    }
    if (!password || password.trim() === '') {
      const toast = await this.toastController.create({
        header: 'Error',
        message: "Please enter your password",
        duration: 1500,
      });
      await toast.present();
      return;
    }

    this.nodeApiService.userLogin(username, password).subscribe((data)=>{
      console.log("success",data)
    });


  }
  

}
