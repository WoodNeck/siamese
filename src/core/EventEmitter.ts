import { AnyFunction, EventCallback, EventKey, EventMap, NoArguments } from "~/type/helper";

/* eslint-disable @typescript-eslint/no-unsafe-call */
class EventEmitter<T extends EventMap> {
  private _listenerMap: {
    [keys: string]: Array<EventCallback<T, EventKey<T>>>;
  };

  public constructor() {
    this._listenerMap = {};
  }

  public on<K extends EventKey<T>>(eventName: K, callback: EventCallback<T, K>): this {
    const listenerMap = this._listenerMap;
    const listeners = listenerMap[eventName];

    if (listeners && listeners.indexOf(callback) < 0) {
      listeners.push(callback);
    } else {
      listenerMap[eventName] = [callback];
    }
    return this;
  }

  public once<K extends EventKey<T>>(eventName: K, callback: EventCallback<T, K>): this {
    const listenerMap = this._listenerMap;
    const listeners = listenerMap[eventName];

    const onceCallback = (...params: any[]) => {
      callback(params);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.off(eventName, onceCallback as any);
    };

    if (listeners && listeners.indexOf(callback) < 0) {
      listeners.push(callback);
    } else {
      listenerMap[eventName] = [callback];
    }
    return this;
  }

  public off<K extends EventKey<T>>(eventName?: K, callback?: EventCallback<T, K>): this {
    const listenerMap = this._listenerMap;

    if (!eventName) {
      this._listenerMap = {};
      return this;
    }

    if (!callback) {
      delete listenerMap[eventName];
      return this;
    }

    const listeners = listenerMap[eventName];

    if (listeners) {
      const callbackIdx = listeners.indexOf(callback);
      if (callbackIdx >= 0) {
        listeners.splice(callbackIdx, 1);
      }
    }

    return this;
  }

  public emit<K extends EventKey<T>>(
    eventName: K,
    ...event: T[K] extends NoArguments ? void[] : T[K] extends AnyFunction ? Parameters<T[K]> : [T[K]]
  ): this {
    const listeners = this._listenerMap[eventName];

    if (listeners) {
      listeners.forEach(callback => {
        callback(...event);
      });
    }

    return this;
  }
}

export default EventEmitter;
