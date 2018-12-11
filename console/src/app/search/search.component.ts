import { Component, EventEmitter, OnDestroy, Output, OnInit } from '@angular/core';
import { MapsService } from '../maps/maps.service';
import { Map } from '../maps/models/map.model';
import { Project } from '../projects/models/project.model';
import { ProjectsService } from '../projects/projects.service';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnDestroy, OnInit {
  @Output() close: EventEmitter<any> = new EventEmitter<any>();
  query: string;
  maps: Map[];
  projects: Project[];
  timeout: any;
  loading: boolean = false;
  mapReq: any;
  projectReq: any;

  constructor(private mapsService: MapsService, private projectsService: ProjectsService) {
  }

  ngOnInit() {
    this.onKeyUp()
  }

  ngOnDestroy() {
    if (this.mapReq) {
      this.mapReq.unsubscribe();
    }
    if (this.projectReq) {
      this.projectReq.unsubscribe();
    }
  }

  onKeyUp() {
    this.maps = this.projects = null;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.loading = true;
      this.mapReq = this.mapsService.filterMaps(null, null, null, this.query).subscribe(data => {
        if (data) {
          this.maps = this.query ? data.items : data.items.slice(0, 5);
        }
        this.loading = false;
      });
      this.projectReq = this.projectsService.filter(null, null, null, this.query).subscribe(data => {
        if (data) {
          this.projects = this.query ? data.items : data.items.slice(0, 5);
        }
        this.loading = false;
      });
    }, 400);
  }

  onClose() {
    this.close.emit();
  }
}
