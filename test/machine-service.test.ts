import { MachineService } from '../src/machine/service';
import { MachineRepository } from '../src/machine/repository';
import { PubSubService } from '../src/pubsub';
import { IMachine, Machine } from '../src/machine';
import { LowStockWarningEvent } from '../src/machine/events/stock-warning';
import { StockLevelOkEvent } from '../src/machine/events/stock-ok';

describe('MachineService', () => {
  let machineService: MachineService;
  let machineRepository: MachineRepository;
  let pubSubService: PubSubService;

  beforeEach(() => {
    const initialMachines = [
      new Machine('001', 5),
      new Machine('002', 3),
      new Machine('003', 1),
    ];
    machineRepository = new MachineRepository(initialMachines);
    pubSubService = new PubSubService();
    machineService = new MachineService(machineRepository, pubSubService);

    jest.spyOn(machineRepository, 'getById');
    jest.spyOn(machineRepository, 'update');
    jest.spyOn(pubSubService, 'publish');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getById', () => {
    it('should return a copy of the machine', () => {
      const result = machineService.getById('001');

      expect(result).toEqual(
        expect.objectContaining({ id: '001', stockLevel: 5, state: 'OK' }),
      );
      expect(result).not.toBe(machineRepository.getById('001'));
      expect(machineRepository.getById).toHaveBeenCalledWith('001');
    });

    it('should return undefined if machine is not found', () => {
      const result = machineService.getById('999');

      expect(result).toBeUndefined();
      expect(machineRepository.getById).toHaveBeenCalledWith('999');
    });
  });

  describe('setStockLevel', () => {
    it('should update stock level and return updated machine', () => {
      const machine = machineService.getById('001') as IMachine;
      const result = machineService.setStockLevel(machine, 8);

      expect(result).toEqual(
        expect.objectContaining({ id: '001', stockLevel: 8, state: 'OK' }),
      );
      expect(machineRepository.update).toHaveBeenCalledWith(
        '001',
        expect.objectContaining({ stockLevel: 8, state: 'OK' }),
      );
    });

    it('should change state to LOW_STOCK and publish event when stock level drops below 3', () => {
      const machine = machineService.getById('001') as IMachine;
      const result = machineService.setStockLevel(machine, 2);

      expect(result).toEqual(
        expect.objectContaining({
          id: '001',
          stockLevel: 2,
          state: 'LOW_STOCK',
        }),
      );
      expect(machineRepository.update).toHaveBeenCalledWith(
        '001',
        expect.objectContaining({ stockLevel: 2, state: 'LOW_STOCK' }),
      );
      expect(pubSubService.publish).toHaveBeenCalledWith(
        expect.any(LowStockWarningEvent),
      );
    });

    it('should change state to OK and publish event when stock level rises to 3 or above', () => {
      const machine = machineService.getById('003') as IMachine;
      const result = machineService.setStockLevel(machine, 3);

      expect(result).toEqual(
        expect.objectContaining({ id: '003', stockLevel: 3, state: 'OK' }),
      );
      expect(machineRepository.update).toHaveBeenCalledWith(
        '003',
        expect.objectContaining({ stockLevel: 3, state: 'OK' }),
      );
      expect(pubSubService.publish).not.toHaveBeenCalled();
    });

    it('should not change state or publish events if stock level remains in the same range', () => {
      const machine = machineService.getById('001') as IMachine;
      const result = machineService.setStockLevel(machine, 4);

      expect(result).toEqual(
        expect.objectContaining({ id: '001', stockLevel: 4, state: 'OK' }),
      );
      expect(machineRepository.update).toHaveBeenCalledWith(
        '001',
        expect.objectContaining({ stockLevel: 4, state: 'OK' }),
      );
      expect(pubSubService.publish).not.toHaveBeenCalled();
    });

    it('should fire LowStockWarningEvent only once when stock level drops below 3', () => {
      const machine = machineService.getById('001') as IMachine;
      machineService.setStockLevel(machine, 2);
      machineService.setStockLevel(
        { ...machine, stockLevel: 2, state: 'LOW_STOCK' },
        1,
      );

      expect(pubSubService.publish).toHaveBeenCalledTimes(1);
      expect(pubSubService.publish).toHaveBeenCalledWith(
        expect.any(LowStockWarningEvent),
      );
    });

    it('should fire StockLevelOkEvent only once when stock level rises to 3 or above', () => {
      const machine = machineService.getById('003') as IMachine;
      machineService.setStockLevel(
        { ...machine, stockLevel: 2, state: 'LOW_STOCK' },
        3,
      );

      expect(pubSubService.publish).toHaveBeenCalledTimes(1);
      expect(pubSubService.publish).toHaveBeenCalledWith(
        expect.any(StockLevelOkEvent),
      );
    });
  });
});
