// interfaces
import {
  Machine,
  MachineRefilledEvent,
  MachineRefilledSubscriber,
  MachineSoldEvent,
  MachineSoldSubscriber,
} from './machine';
import { IEvent, IPublishSubscribeService, PubSubService } from './pubsub';

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
    new Machine('001'),
    new Machine('002'),
    new Machine('003'),
  ];

  // create a machine sale event subscriber. inject the machines (all subscribers should do this)
  const machineSoldSubscriber = new MachineSoldSubscriber(machines);
  const machineRefilledSubscriber = new MachineRefilledSubscriber(machines);

  // create the PubSub service
  const pubSubService: IPublishSubscribeService = new PubSubService();

  pubSubService.subscribe(MachineSoldEvent.EVENT_NAME, machineSoldSubscriber);
  pubSubService.subscribe(
    MachineRefilledEvent.EVENT_NAME,
    machineRefilledSubscriber,
  );

  const events = [
    new MachineSoldEvent(1, '001'),
    new MachineSoldEvent(2, '002'),
    new MachineRefilledEvent(3, '003'),
    new MachineRefilledEvent(5, '001'),
    new MachineSoldEvent(1, '003'),
  ];

  events.map((e) => pubSubService.publish(e));
})();
