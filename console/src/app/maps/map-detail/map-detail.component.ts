import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import * as _ from "lodash";
import { Subscription } from "rxjs/Subscription";

import { MapsService } from "../maps.service";
import { Map } from "../models/map.model";
import { MapStructure } from "../models/map-structure.model";

@Component({
  selector: 'app-map-detail',
  templateUrl: './map-detail.component.html',
  styleUrls: ['./map-detail.component.scss']
})
export class MapDetailComponent implements OnInit, OnDestroy {
  id: string;
  originalMap: Map;
  map: Map;
  routeReq: any;
  mapReq: any;
  mapExecReq: any;
  mapStructure: MapStructure;
  mapStructureReq: any;
  originalMapStructure: MapStructure;
  mapStructureSubscription: Subscription;
  edited: boolean = false;
  structureEdited: boolean = false;
  initiated: boolean = false;

  constructor(private route: ActivatedRoute, private mapsService: MapsService) {
  }

  ngOnInit() {
    this.routeReq = this.route.params.subscribe(params => {
      this.id = params["id"];
      this.mapReq = this.mapsService.getMap(this.id).subscribe(map => {
        this.map = map;
        this.originalMap = _.cloneDeep(map);
        this.mapsService.setCurrentMap(map);
        this.mapStructureReq = this.mapsService.getMapStructure(this.id).subscribe(structure => {
          if (structure === null) {
            structure = new MapStructure();
            structure.map = params["id"];
          }
          this.mapsService.setCurrentMapStructure(structure);
        })
      }, () => {
        console.log("Couldn't get map model");
      });
    });
    this.mapsService.getCurrentMap().subscribe(map => {
      if (map) {
        this.map = map;
        if (!_.isEqual(map, this.originalMap)) {
          this.edited = true;
        } else {
          this.edited = false;
        }
      }
    });
    this.mapStructureSubscription = this.mapsService.getCurrentMapStructure().subscribe(structure => {
      if (!structure) {
        return;
      }
      if (!this.initiated) {
        this.originalMapStructure = _.cloneDeep(structure);
      }
      if (this.initiated && !_.isEqual(structure, this.originalMapStructure)) {
        this.structureEdited = true;
      } else {
        this.structureEdited = false;
      }
      this.mapStructure = structure;
      this.initiated = true;
    });
  }

  ngOnDestroy() {
    this.routeReq.unsubscribe();
    this.mapReq.unsubscribe();
    this.mapStructureReq.unsubscribe();
    if (this.mapExecReq) {
      this.mapExecReq.unsubscribe();
    }
    this.mapsService.clearCurrentMap();
    this.mapsService.clearCurrentMapStructure();

  }

  discardChanges(){
    this.mapsService.setCurrentMapStructure(this.originalMapStructure);
  }

  executeMap() {
    this.mapExecReq = this.mapsService.execute(this.id).subscribe();
  }

  saveMap() {
    if (this.edited) {
      this.mapsService.updateMap(this.map.id, this.map).subscribe(() => {
        this.originalMap = _.cloneDeep(this.map);
        this.edited = false;
      }, error => {
        console.log(error);
      });
    }
    if (this.structureEdited) {
      delete this.mapStructure._id;
      delete this.mapStructure.id;
      delete this.mapStructure.createdAt;
      this.mapsService.createMapStructure(this.map.id, this.mapStructure).subscribe(() => {
        this.originalMapStructure = _.cloneDeep(this.mapStructure);
        this.structureEdited = false;
      }, error => {
        console.log(error);
      });
    }

  }

}
