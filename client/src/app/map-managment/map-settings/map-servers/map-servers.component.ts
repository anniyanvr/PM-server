import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChange } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import { ServersPopupComponent } from '../../../shared/popups/servers-popup/servers-popup.component';
import { ServersService } from '../../../shared/services/servers.service';
import { MapService } from '../../../shared/services/map.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-map-servers',
  templateUrl: './map-servers.component.html',
  styleUrls: ['./map-servers.component.css']
})
export class MapServersComponent implements OnInit, OnChanges, OnDestroy {

  map: any;
  agents: any[] = null;
  search: any;
  interval: any;
  currentMapSubscription: Subscription;

  constructor(public modalService: NgbModal, public  serverService: ServersService, private mapService: MapService) { }

  ngOnInit() {
    this.search = {
      type: 1, /* Search by name */
      text: ""
    };

    this.currentMapSubscription = this.mapService.getCurrentMapObservable()
    .subscribe(
      (map) => {
        this.map = map;
        // now make sure that when switching between maps (after this component was initiated) the agents will be set according to the new map
        if (map && map.activeServers) {
          this.agents = _.toArray(map.activeServers);
        } else {
          this.agents = null;
        }
      }
    );

  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {
    if (changes['map'].currentValue != null) {
      this.agents = _.filter(_.toArray(this.map.activeServers), (o: any) => { return o.active; });
    }
  }

  ngOnDestroy() {
    this.currentMapSubscription.unsubscribe();
  }

  addServer() {
    let dialog = this.modalService.open(ServersPopupComponent);
    dialog.result.then((data: any) => {
      data = _.toArray(data);
      this.map.activeServers = data;
      console.log("PASSING MAP TO SERVICE", this.map);
      this.mapService.updateMap(this.map).subscribe((m) => {
        this.mapService.selectMap(this.map);
      });
    });
  }

}
