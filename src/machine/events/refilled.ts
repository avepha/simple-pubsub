import { IEvent } from '../../pubsub';
import { MachineSubscriber } from '../interface';
import { StockLevelOkEvent } from './stock-ok';

export class MachineRefilledEvent implements IEvent {
  static EVENT_NAME = 'machine_refilled';

  constructor(
    private readonly _refill: number,
    private readonly _machineId: string,
  ) {}

  getRefillQuantity(): number {
    return this._refill;
  }

  machineId(): string {
    return this._machineId;
  }

  type(): string {
    return MachineRefilledEvent.EVENT_NAME;
  }
}

export class MachineRefilledSubscriber extends MachineSubscriber {
  handle(event: MachineRefilledEvent): void {
    const machine = this.machines.get(event.machineId());
    if (!machine) {
      console.log('No machine found for id', event.machineId());
      return;
    }

    machine.stockLevel += event.getRefillQuantity();
    this.log(event, machine);

    if (machine.state === 'LOW_STOCK' && machine.stockLevel >= 3) {
      machine.state = 'OK';
      this.pubSubService?.publish(
        new StockLevelOkEvent(machine.stockLevel, machine.id),
      );
    }
  }
}
