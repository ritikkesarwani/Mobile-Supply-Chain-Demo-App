// import { Injectable } from '@angular/core';
// import { Network } from '@capacitor/network';
// import { BehaviorSubject, Observable, connect, interval } from 'rxjs';
// import { UiService } from './ui.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class NetworkService {

//   networkStatus!: string; 
//   private hasShownToast = false; 
//   private onlineStatusSubject = new BehaviorSubject<boolean>(true);

//   constructor(
//     private uiProviderService: UiService
//   ) {
//     this.startChecking(5000);
//    }

//   /* common method to check network status */ 
//   startChecking(intervalDuration: number = 5000*100): Observable<boolean> {
//     interval(intervalDuration).subscribe(async () => {
//       const status = await Network.getStatus();
//       if (status.connected) {
//         // console.log('Online'); 
//         this.hasShownToast = false; 
//         this.onlineStatusSubject.next(true);
//       } else { 
//         // console.log('Offline'); 
//         if (!this.hasShownToast) { 
//           this.uiProviderService.presentToast('Connection Status', 'Offline'); 
//           this.hasShownToast = true; 
//           this.onlineStatusSubject.next(false); 
//         } 
//       }
//     }); 
//     return this.onlineStatusSubject.asObservable();
//   } 
  
//   isNetworkAvailable(): Observable<boolean> { 
//     return this.onlineStatusSubject.asObservable(); 
//   }

// }

import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';
import { UiService } from './ui.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private onlineStatusSubject = new BehaviorSubject<boolean>(true);

  constructor(
    private uiProviderService: UiService
  ) {
    this.startChecking();
  }

  /* common method to check network status */
  async startChecking(): Promise<void> {
    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        this.uiProviderService.presentToast('Connection Status', 'Online');
        this.onlineStatusSubject.next(true);
      } else {
        this.uiProviderService.presentToast('Connection Status', 'Offline');
        this.onlineStatusSubject.next(false);
      }
    });
  }

  isNetworkAvailable(): Observable<boolean> {
    return this.onlineStatusSubject.asObservable();
  }

}
