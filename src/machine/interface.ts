import { IEvent, IPublishSubscribeService, ISubscriber } from '../pubsub';
import { MachineService } from './service';

type MachineState = 'OK' | 'LOW_STOCK';

export interface IMachine {
  state: MachineState;
  stockLevel: number;
  id: string;
}

export class Machine {
  state: MachineState;

  constructor(
    public readonly id: string,
    public readonly stockLevel: number = 10,
  ) {
    this.state = 'OK'; // default state to OK
  }
}

export abstract class MachineSubscriber implements ISubscriber {
  constructor(protected readonly machineService: MachineService) {}

  public handle(event: IEvent): void {
    console.log('Subscriber received event', event);
  }
}
