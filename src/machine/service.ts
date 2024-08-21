import { IMachine } from './interface';
import { MachineRepository } from './repository';
import { IPublishSubscribeService } from '../pubsub';
import { LowStockWarningEvent } from './events/stock-warning';
import { StockLevelOkEvent } from './events/stock-ok';

export class MachineService {
  constructor(
    private machineRepository: MachineRepository,
    private pubSubService: IPublishSubscribeService,
  ) {}

  public getById(id: string): IMachine | undefined {
    const machine = this.machineRepository.getById(id);

    // Avoid referencing machine object
    return machine ? Object.assign({}, machine) : undefined;
  }

  public setStockLevel(machine: IMachine, stockLevel: number): IMachine {
    const isReachingLowStockState = machine.state === 'OK' && stockLevel < 3;
    const isReachingOkState = machine.state === 'LOW_STOCK' && stockLevel >= 3;

    let desiredState = machine.state;

    if (isReachingOkState) {
      desiredState = 'OK';
    }

    if (isReachingLowStockState) {
      desiredState = 'LOW_STOCK';
    }

    const updatedMachine = this.machineRepository.update(machine.id, {
      stockLevel,
      state: desiredState,
    }) as IMachine;

    const shouldFireLowStockWarning =
      machine.state === 'OK' && updatedMachine.state === 'LOW_STOCK';

    const shouldFireStockLevelOk =
      machine.state === 'LOW_STOCK' && updatedMachine.state === 'OK';

    if (shouldFireLowStockWarning) {
      this.pubSubService.publish(
        new LowStockWarningEvent(machine.stockLevel, machine.id),
      );
    }

    if (shouldFireStockLevelOk) {
      this.pubSubService.publish(
        new StockLevelOkEvent(machine.stockLevel, machine.id),
      );
    }

    return updatedMachine;
  }
}
