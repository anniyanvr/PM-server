import { Agent } from '@app/services/agent/agent.model';
import { ISNode } from '../interfaces/snode.interface';

export class SNode implements ISNode {
  name: string;
  parent?: SNode;
  children?: [SNode];
  agent?: string | Agent;
}
