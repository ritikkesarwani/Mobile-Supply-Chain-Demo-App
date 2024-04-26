import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { connect } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  networkValue: any;
  constructor() { }

  // Method to listen to network status changes
  addNetworkListener(callback: (status: any) => void) {
    Network.addListener('networkStatusChange', callback);
  }

  // Method to get current network status
  async getCurrentNetworkStatus() {
    this.networkValue =  await Network.getStatus();
    return this.networkValue.connected;
  }
}
