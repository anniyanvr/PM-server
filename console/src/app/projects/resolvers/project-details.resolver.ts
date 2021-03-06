import { Resolve, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot,Router } from '@angular/router';
import { Project } from '@projects/models/project.model';
import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';
import { ProjectsService } from '../projects.service';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ProjectDetailsResolver implements Resolve<Project>{
    constructor(private projectsService: ProjectsService,private router: Router,) { };

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Project>{
        return this.projectsService.detail(route.params.id).pipe(
            map((project)=> {
                if(project){
                    return project;
                }
                this.router.navigate(['NotFound'])
            }),
            catchError(error => {
                this.router.navigate(['NotFound'])
                return throwError(error);
            })
        )
    }
} 