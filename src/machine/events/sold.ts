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
    const currentMachine = this.machineService.getById(event.machineId());
    if (!currentMachine) {
      console.log('No machine found for id', event.machineId());
      return;
    }

    const stockLevel = currentMachine.stockLevel - event.getSoldQuantity();
    const updatedMachine = this.machineService.setStockLevel(
      currentMachine,
      stockLevel,
    );

    console.log(
      `[Sold] Machine ${event.machineId()} from ${
        currentMachine.stockLevel
      } to ${updatedMachine.stockLevel}`,
    );
  }
}
