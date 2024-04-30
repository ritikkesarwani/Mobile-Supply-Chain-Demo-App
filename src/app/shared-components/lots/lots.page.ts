import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-lots',
  templateUrl: './lots.page.html',
  styleUrls: ['./lots.page.scss'],
})
export class LotsPage implements OnInit {

  @Input() lotData: any[] = [];
  @Output() openLot: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
  }

  onOpenLot() {
    this.openLot.emit();
  }

}
