import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.scss'],
})
export class ScanComponent  implements OnInit {
  @Input() searchTerm: any = "";
  @Input() showSearch: boolean = false;
  @Output() toggleClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() searchChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearSearchChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendScanValue: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private uiProviderService: UiService
  ) { }

  ngOnInit() { }


  async scan(): Promise<void> {
    await BarcodeScanner.checkPermission({ force: true });
    BarcodeScanner.hideBackground();
    BarcodeScanner.prepare();
    const result = await BarcodeScanner.startScan();
    if (result.hasContent) {
      this.sendScanValue.emit(result.content);
    }
    else {
      this.uiProviderService.presentToast('Error', 'invalid barcode', 'danger');
    }
  }

  stopScan() {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
  }

  updateFilteredOptions() {
    this.searchChange.emit(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.clearSearchChange.emit(this.searchTerm)
  }

}
