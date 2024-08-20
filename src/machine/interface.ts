import { IEvent, ISubscriber } from '../pubsub';

export interface IMachine {
  stockLevel: number;
  id: string;
}

export class Machine {
  constructor(
    public readonly id: string,
    public readonly stockLevel: number = 10,
  ) {}
}

export abstract class MachineSubscriber implements ISubscriber {
  protected readonly machines: Map<string, IMachine>;

  constructor(_machine: IMachine[]) {
    this.machines = new Map();
    _machine.map((machine) => this.machines.set(machine.id, machine));
  }

  public handle(event: IEvent): void {
    console.log('Subscriber received event', event);
  }

  public registerMachine(machine: IMachine): void {
    this.machines.set(machine.id, machine);
  }

  public unregisterMachine(machineId: string): void {
    const isRemoved = this.machines.delete(machineId);
    if (!isRemoved) {
      console.log(`Machine ${machineId} not found`);
    }
  }

  protected log(event: IEvent, machine: IMachine) {
    console.log(
      `[${event.type()}] Machine`,
      machine.id,
      'stock level is now',
      machine.stockLevel,
    );
  }
}
