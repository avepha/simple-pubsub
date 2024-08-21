import { IMachine } from './interface';

export class MachineRepository {
  private machines: Map<string, IMachine>;

  constructor(initialMachines: IMachine[]) {
    this.machines = new Map();
    initialMachines.map((machine) => this.machines.set(machine.id, machine));
  }

  public getById(id: string): IMachine | undefined {
    return this.machines.get(id);
  }

  public update(
    machineId: string,
    input: Partial<IMachine>,
  ): IMachine | undefined {
    const machine = this.machines.get(machineId);
    if (!machine) {
      console.log(`Machine ${machineId} not found`);
      return;
    }

    machine.stockLevel = input.stockLevel ?? machine.stockLevel;
    machine.state = input.state ?? machine.state;

    return machine;
  }
}
