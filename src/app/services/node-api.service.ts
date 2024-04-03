import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class NodeApiService {

  constructor(private http: HttpClient) { }
  

  userLogin(username:string,password:string) {
    return this.http.post("https://testnode.propelapps.com/EBS/20D/login", {username,password});
  }
}
