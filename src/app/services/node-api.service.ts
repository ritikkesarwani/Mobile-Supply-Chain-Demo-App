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

  getAllOrganization(id: any) {
    return this.http.get(`https://testnode.propelapps.com/EBS/23A/getInventoryOrganizationsTable/${id}`, {observe:'response'});
  }

  fetchAllByUrl(url: string) {
    return this.http.get(url, {observe: 'response'});
  }
}
