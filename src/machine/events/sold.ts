import { IEvent } from '../../pubsub';
import { MachineSubscriber } from '../interface';

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
    console.log(
      `Sold(${event.getSoldQuantity()}) to ${event.machineId()}:  ${currentMachine.stockLevel} -> ${stockLevel}`,
    );

    this.machineService.setStockLevel(currentMachine, stockLevel);
  }
}
