import { IEvent } from '../../pubsub';
import { MachineSubscriber } from '../interface';
import { LowStockWarningEvent } from './stock-warning';

export class MachineSoldEvent implements IEvent {
  static EVENT_NAME = 'machine_sold';

  constructor(
    private readonly _sold: number,
    private readonly _machineId: string,
  ) {}

  machineId(): string {
    return this._machineId;
  }

  getSoldQuantity(): number {
    return this._sold;
  }

  type(): string {
    return MachineSoldEvent.EVENT_NAME;
  }
}

export class MachineSoldSubscriber extends MachineSubscriber {
  handle(event: MachineSoldEvent): void {
    const machine = this.machines.get(event.machineId());

    if (!machine) {
      console.log('No machine found for id', event.machineId());

      return;
    }

    machine.stockLevel -= event.getSoldQuantity();
    this.log(event, machine);

    if (machine.state === 'OK' && machine.stockLevel < 3) {
      machine.state = 'LOW_STOCK';
      this.pubSubService?.publish(
        new LowStockWarningEvent(machine.stockLevel, machine.id),
      );
    }
  }
}
