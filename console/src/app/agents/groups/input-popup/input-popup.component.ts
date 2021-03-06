import {Component} from '@angular/core';
import {Subject} from 'rxjs';
import {BsModalRef} from 'ngx-bootstrap';

@Component({
  selector: 'app-input-popup',
  templateUrl: './input-popup.component.html',
  styleUrls: ['./input-popup.component.scss']
})
export class InputPopupComponent {
  name: any;
  result: Subject<string> = new Subject<string>();

  constructor(public bsModalRef: BsModalRef) {
  }

  onClose() {
    this.bsModalRef.hide();
  }

  onConfirm() {
    this.result.next(this.name);
    this.onClose();
  }

}
