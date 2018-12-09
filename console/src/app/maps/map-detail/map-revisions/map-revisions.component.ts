import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as $ from 'jquery';
import * as joint from 'jointjs';

import { MapsService } from '../../maps.service';
import { MapStructure, Process } from '@maps/models';
import { Project } from '@projects/models/project.model';
import { ProjectsService } from '@projects/projects.service';
import { SocketService } from '@shared/socket.service';
import { DiffEditorModel } from 'ngx-monaco-editor';
import { BsModalService } from 'ngx-bootstrap';
import { MapDuplicateComponent } from '@maps/map-detail/map-revisions/mapduplicate-popup/mapduplicate-popup.component';


@Component({
  selector: 'app-map-revisions',
  templateUrl: './map-revisions.component.html',
  styleUrls: ['./map-revisions.component.scss']
})
export class MapRevisionsComponent implements OnInit {
  previewProcess: Process;
  structures: MapStructure[] = [];
  structureId: string;
  mapId: string;
  graph: joint.dia.Graph;
  paper: joint.dia.Paper;
  projectsReq: any;
  project: Project;
  scrollCallback: any;
  page: number = 1;
  morePages: boolean = true;
  currentStructure: MapStructure;
  viewMode: 'code' | 'design' = 'design';
  latestStructure: MapStructure;
  @ViewChild('wrapper') wrapper: ElementRef;
  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    readOnly: true
  };
  latestCode: string;
  currentCode: string;
  
  monacoOptions = {
    theme: 'vs-dark'
  };
  

  constructor(private mapsService: MapsService, private router: Router, private route: ActivatedRoute, private projectsService: ProjectsService, private socketService: SocketService, private modalService: BsModalService) {
    this.scrollCallback = this.loadRevisions.bind(this);
  }

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.mapId = params.id;
      this.getMapProject();
      this.getMapStructures(1);
    });
    this.wrapper.nativeElement.maxHeight = this.wrapper.nativeElement.offsetHeight;
    this.graph = new joint.dia.Graph;
    this.paper = new joint.dia.Paper({
      el: $('#graph'),
      width: this.wrapper.nativeElement.offsetWidth,
      height: this.wrapper.nativeElement.offsetHeight,
      gridSize: 1,
      model: this.graph,
      interactive: false
    });
    this.defineShape();
    this.paper.scale(0.75, 0.75);
    this.addPaperDrag();
    this.listeners();
  }

  originalModel: DiffEditorModel = {
    code: this.latestCode,
    language: 'text/javascript'
  };
 
  modifiedModel: DiffEditorModel = {
    code: this.currentCode,
    language: 'text/javascript'
  };

  addPaperDrag() {
    let initialPosition = { x: 0, y: 0 };
    let move = false;
    this.paper.on('blank:pointerdown', (event, x, y) => {
      initialPosition = { x: x * 0.75, y: y * 0.75 };
      move = true;
    });

    $('#graph').mousemove((event) => {
      if (move) {
        this.paper.translate(event.offsetX - initialPosition.x, event.offsetY - initialPosition.y);
      }
    });

    this.paper.on('blank:pointerup', (event, x, y) => {
      move = false;
    });
  }

  listeners() {
    this.paper.on('cell:pointerup', (cellView, evt, x, y) => {
      if (cellView.model.isLink()) {
        return;
      }
      this.previewProcess = this.currentStructure.processes.find(p => p.uuid === cellView.model.id);
    });
  }

  getMapStructures(page: number) {
    this.mapsService.structuresList(this.mapId, page).subscribe(structures => {
      this.previewStructure(structures[0].id)
      if (structures && structures.length > 0) {
        this.structures = [...this.structures, ...structures];
      } else {
        this.morePages = false;
      }
    });
  }

  getMapProject() {
    this.projectsReq = this.projectsService.filter().subscribe(data => {
      data.items.forEach(project => {
        if ((<string[]>project.maps).indexOf(this.mapId) > -1) {
          this.project = project;
        }
      });
    });
  }

  changeStructure(structureId) {
    this.mapsService.getMapStructure(this.mapId, structureId).subscribe(structure => {
      this.mapsService.setCurrentMapStructure(structure);
      this.socketService.setNotification({
        title: 'Changed version',
        type: 'info'
      });
    });
  }

  defineShape() {
    joint.shapes.devs['MyImageModel'] = joint.shapes.devs.Model.extend({

      markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><image/><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',

      defaults: joint.util.deepSupplement({

        type: 'devs.MyImageModel',
        size: {
          width: 80,
          height: 80
        },
        attrs: {
          rect: {
            'stroke-width': '1',
            'stroke-opacity': .7,
            stroke: '#7f7f7f',
            rx: 3,
            ry: 3,
            fill: '#2d3236'
            // 'fill-opacity': .5
          },
          circle: {
            stroke: 'gray'
          },
          '.label': {
            text: '',
            'ref-y': 5,
            'font-size': 14,
            fill: '#bbbbbb'
          },
          image: {
            'xlink:href': 'http://via.placeholder.com/350x150',
            width: 46,
            height: 32,
            'ref-x': 50,
            'ref-y': 50,
            ref: 'rect',
            'x-alignment': 'middle',
            'y-alignment': 'middle'
          },
          '.inPorts circle': {
            fill: '#c8c8c8'
          },
          '.outPorts circle': {
            fill: '#262626'
          }
        }
      }, joint.shapes.devs.Model.prototype.defaults)
    });


    joint.shapes.devs['PMStartPoint'] = joint.shapes.devs.Model.extend({

      markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><image/><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',
      portMarkup: '<g class="port"><circle class="port-body"/><text class="port-label"/></g>',

      defaults: joint.util.deepSupplement({

        type: 'devs.PMStartPoint',
        size: { width: 40, height: 39 },
        outPorts: [' '],
        attrs: {
          '.body': { stroke: '#3c3e41', fill: '#2c2c2c', 'rx': 6, 'ry': 6, 'opacity': 0 },
          '.label': {
            text: '', 'ref-y': 0.83, 'y-alignment': 'middle',
            fill: '#f1f1f1', 'font-size': 13
          },
          '.port-body': { r: 7.5, stroke: 'gray', fill: '#2c2c2c', magnet: 'active' },
          'image': {
            'ref-x': 10, 'ref-y': 18, ref: 'rect',
            width: 35, height: 34, 'y-alignment': 'middle',
            'x-alignment': 'middle', 'xlink:href': 'assets/images/start.png'
          }
        }

      }, joint.shapes.devs.Model.prototype.defaults)
    });
  }

  duplicateMap(structureId: string) {
    const modal = this.modalService.show(MapDuplicateComponent);
    modal.content.result
      .take(1)
      .filter(obj => !!obj.name) // filtering only results with a name
      .flatMap(obj =>  this.mapsService.duplicateMap(this.mapId, structureId, this.project.id,obj))
      .subscribe(map => { this.router.navigate(['/maps', map.id]);
    });
  }
  
  previewStructure(structureId: string) {
    this.previewProcess = null;
    this.mapsService.getMapStructure(this.mapId, structureId)
      .subscribe(structure => {
        this.currentStructure = structure;
        this.graph.fromJSON(JSON.parse(structure.content));
        this.originalModel = {
          code : structure.code,
          language : 'javascript'
        }
        if (!this.latestStructure) {
          this.setLatestStructure(this.mapId, this.structures[0].id);
        }
    
        if (this.viewMode === 'code') {
          this.loadCodeDiff();
        }
      });

   
  }

  onResize(event) {
    // when resizing window paper size should be updated
    this.paper.setDimensions(this.wrapper.nativeElement.offsetWidth, this.wrapper.nativeElement.offsetHeight);
  }

  onVersionScroll(event) {
  }

  loadRevisions() {
    if (!this.morePages) {
      return;
    }
    this.page++;
    this.getMapStructures(this.page);
  }

  changeMode(mode: 'code' | 'design') {
    this.viewMode = mode;
    this.graph.clear();
    if (mode === 'code') {
      this.loadCodeDiff();
    } else {
      setTimeout(() => {

        this.graph.fromJSON(JSON.parse(this.currentStructure.content));
      }, 0);
    }
  }

  loadCodeDiff() {
    this.latestCode = this.latestStructure.code || '';
    this.currentCode = this.currentStructure.code || '';
  }

  setLatestStructure(mapId: string, structureId: string) {
    this.mapsService.getMapStructure(mapId, structureId)
      .take(1)
      .subscribe(structure => {
        this.latestStructure = structure
        this.modifiedModel.code = structure.code;
      });
  }

  onClose() {
    this.previewProcess = null;
  }
}
