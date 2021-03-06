import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MapsService } from '@app/services/map/maps.service';
import { Map } from '@app/services/map/models/map.model';
import { MapStructure } from '@maps/models';
import { MapDesignService } from './map-design.service';

@Component({
  selector: 'app-map-edit',
  templateUrl: './map-edit.component.html',
  styleUrls: ['./map-edit.component.scss'],
  providers: [MapDesignService]
})
export class MapEditComponent implements OnInit, OnDestroy {
  mapStructure: MapStructure;
  map: Map;
  activeTab: any;

  private mainSubscription = new Subscription();

  envTabs = [
    {key : 'agents', label: 'Agents', icon: 'icon-agent'},
    {key : 'triggers', label: 'Triggers', icon: 'icon-trigger'},
    {key : 'plugins', label: 'Plugins', icon: 'icon-plugins'}
  ];

  @ViewChild('wrapper') wrapper: ElementRef;


  constructor(private mapsService: MapsService, public designService: MapDesignService) {
  }

  ngOnInit() {
    const mapSubscription = this.mapsService.getCurrentMap().subscribe(map => {
      if (map) {
        this.map = map;
      }
    });

    const currentMapSubscription = this.mapsService.getCurrentMapStructure().subscribe(structure => {
      this.mapStructure = structure;
    });

    this.mainSubscription.add(mapSubscription);
    this.mainSubscription.add(currentMapSubscription);
  }

  closeTabs() {
    this.activeTab = null;
    this.designService.tabOpen = false;
  }

  openTab(tab) {
    this.activeTab = tab;
    this.designService.tabOpen = true;
  }

  ngOnDestroy(): void {
    this.mainSubscription.unsubscribe();
  }
}
