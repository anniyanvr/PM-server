import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.scss']
})
export class FeatureComponent implements OnInit {
  @Input('items') items: any[];
  @Input('prefix') prefix: string;

  constructor() {
  }
  ngOnInit() {
    // console.log(this.prefix);
  }

}
