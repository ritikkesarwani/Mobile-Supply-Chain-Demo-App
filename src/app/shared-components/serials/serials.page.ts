import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-serials',
  templateUrl: './serials.page.html',
  styleUrls: ['./serials.page.scss'],
})
export class SerialsPage implements OnInit {

  @Input() serialData: any[] = [];
  @Output() openSerial: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
  }

  onOpenSerial() {
    this.openSerial.emit();
  }
}
