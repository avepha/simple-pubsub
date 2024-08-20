export interface IEvent {
  type(): string;
  machineId(): string;
}

export interface ISubscriber {
  handle(event: IEvent): void;
}

export interface IPublishSubscribeService {
  publish(event: IEvent): void;
  subscribe(type: string, handler: ISubscriber): void;
  unsubscribe(eventName: string): boolean;
}

export class PubSubService implements IPublishSubscribeService {
  private subscribers: Map<string, ISubscriber[]>;
  constructor() {
    this.subscribers = new Map();
  }

  public publish(event: IEvent): void {
    const subscribers = this.subscribers.get(event.type());
    subscribers?.map((subscriber) => subscriber.handle(event));
  }

  public subscribe(type: string, handler: ISubscriber): void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }

    this.subscribers.get(type)?.push(handler);
  }

  public unsubscribe(eventName: string) {
    return this.subscribers.delete(eventName);
  }
}
