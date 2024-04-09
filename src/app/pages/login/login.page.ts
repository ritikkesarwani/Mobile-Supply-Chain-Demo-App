import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  showPassword: boolean = false;

  constructor(private loginService: LoginService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl(null, { validators: [Validators.required] }),
      password: new FormControl(null, { validators: [Validators.required] }),
    })
  }

  async login() {
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;
    this.loginService.login(username, password);
  }

}
