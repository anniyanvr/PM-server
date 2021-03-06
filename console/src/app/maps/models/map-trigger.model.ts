import { Map } from '@app/services/map/models/map.model';
import { ITriggerActionParam } from '../interfaces/map-trigger.interface';
import { IParam } from '@shared/interfaces/param.interface';
import { PluginMethod, PluginMethodParam } from '@plugins/models';


export class TriggerActionParam implements ITriggerActionParam, IParam {
  value: string;
  viewName: string;
  param: string | PluginMethodParam;
  name: string;
}

export class MapTrigger {
  id?: string;
  // tslint:disable-next-line:variable-name
  _id?: string;
  map: string | Map;
  name: string;
  description?: string;
  configuration?: string;
  createdAt?: Date;
  active?: boolean;
  plugin: string | Plugin;
  method: string | PluginMethod;
  params: [TriggerActionParam];
}

