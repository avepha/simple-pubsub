import { IEvent } from '../../pubsub';
import { MachineSubscriber } from '../interface';

export class StockLevelOkEvent implements IEvent {
  static EVENT_NAME = 'stock_level_ok';

  constructor(
    private readonly _currentStockLevel: number,
    private readonly _machineId: string,
    private readonly _type: string = StockLevelOkEvent.EVENT_NAME,
  ) {}

  machineId(): string {
    return this._machineId;
  }

  getCurrentStockLevel(): number {
    return this._currentStockLevel;
  }

  type(): string {
    return StockLevelOkEvent.EVENT_NAME;
  }
}

export class StockLevelOkSubscriber extends MachineSubscriber {
  handle(event: StockLevelOkEvent): void {
    const machine = this.machineService.getById(event.machineId());

    if (!machine) {
      console.log('No machine found for id', event.machineId());

      return;
    }

    console.log(`[StockLevelOk] Machine ${event.machineId()}`);
  }
}
