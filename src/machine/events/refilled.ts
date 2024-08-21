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
    const currentMachine = this.machineService.getById(event.machineId());
    if (!currentMachine) {
      console.log('No machine found for id', event.machineId());
      return;
    }

    const stockLevel = currentMachine.stockLevel + event.getRefillQuantity();
    const updatedMachine = this.machineService.setStockLevel(
      currentMachine,
      stockLevel,
    );
    console.log(
      `[Refill] Machine ${event.machineId()} from ${
        currentMachine.stockLevel
      } to ${updatedMachine.stockLevel}`,
    );
  }
}
