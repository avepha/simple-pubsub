import { IEvent } from '../../pubsub';
import { MachineSubscriber } from '../interface';

export class LowStockWarningEvent implements IEvent {
  static EVENT_NAME = 'low_stock_warning';

  constructor(
    private readonly _currentStockLevel: number,
    private readonly _machineId: string,
  ) {}

  machineId(): string {
    return this._machineId;
  }

  getCurrentStockLevel(): number {
    return this._currentStockLevel;
  }

  type(): string {
    return LowStockWarningEvent.EVENT_NAME;
  }
}

export class LowStockWarningSubscriber extends MachineSubscriber {
  handle(event: LowStockWarningEvent): void {
    const machine = this.machines.get(event.machineId());

    if (!machine) {
      console.log('No machine found for id', event.machineId());

      return;
    }

    this.log(event, machine);
  }
}
