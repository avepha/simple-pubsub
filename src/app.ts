// interfaces
import {
  Machine,
  MachineRefilledEvent,
  MachineRefilledSubscriber,
  MachineSoldEvent,
  MachineSoldSubscriber,
} from './machine';
import { IEvent, IPublishSubscribeService, PubSubService } from './pubsub';
import {
  LowStockWarningEvent,
  LowStockWarningSubscriber,
} from './machine/events/stock-warning';

// helpers
const randomMachine = (): string => {
  const random = Math.random() * 3;
  if (random < 1) {
    return '001';
  } else if (random < 2) {
    return '002';
  }
  return '003';
};

const eventGenerator = (): IEvent => {
  const random = Math.random();
  if (random < 0.5) {
    const saleQty = Math.random() < 0.5 ? 1 : 2; // 1 or 2
    return new MachineSoldEvent(saleQty, randomMachine());
  }
  const refillQty = Math.random() < 0.5 ? 3 : 5; // 3 or 5
  return new MachineRefilledEvent(refillQty, randomMachine());
};

// program
(async () => {
  // create 3 machines with a quantity of 10 stock
  const machines: Machine[] = [
    new Machine('001', 2),
    new Machine('002', 5),
    new Machine('003', 5),
  ];

  // create a machine sale event subscriber. inject the machines (all subscribers should do this)
  const pubSubService: IPublishSubscribeService = new PubSubService();

  const soldSubscriber = new MachineSoldSubscriber(machines);
  const refilledSubscriber = new MachineRefilledSubscriber(machines);
  const lowStockWarningEvent = new LowStockWarningSubscriber(machines);

  pubSubService.subscribe(MachineSoldEvent.EVENT_NAME, soldSubscriber);
  pubSubService.subscribe(MachineRefilledEvent.EVENT_NAME, refilledSubscriber);
  pubSubService.subscribe(
    LowStockWarningEvent.EVENT_NAME,
    lowStockWarningEvent,
  );

  const events = [new MachineSoldEvent(1, '001')];

  events.map((e) => pubSubService.publish(e));
})();
