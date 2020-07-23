// const obs = new Observable((next) => {
//   // do work
//   next(42)
// })
//
// obs.subscribe((v) => {
//   console.log(v) // ---> 42
// })

// import {Subject} from "./Subject";

export class Observable {
  constructor(workerFunction) {
    // save function to call it latter
    this._worker = workerFunction;
  }

  subscribe({ next, complete, error }) {
    // pass the observer object to the previous saved worker function, call it
    return this._worker({ next, error, complete });
  }

  unsubscribe() {
    this._worker = (next, complete, error) => {};
  }

  static fromEvent(domElement, eventName) {
    return new Observable(({ next, complete, error }) => {
      // call observer.next on every event call
      domElement.addEventListener(eventName, next);

      return {
        unsubscribe: () => {
          domElement.removeEventListener(eventName, next);
        },
      };
    });
  }

  static interval(time) {
    const self = this;
    return new Observable(({ next, complete, error }) => {
      const id = setInterval(() => {
        next();
      }, time);

      return {
        unsubscribe: () => {
          clearInterval(id);
        },
      };
    });
  }

  // emits values until the endObservable fires for the first time
  takeUntil(endObservable) {
    const self = this;
    return new Observable((observer) => {
      const subs = self.subscribe({
        next: (val) => {
          observer.next(val);
        },
      });

      endObservable.subscribe({
        next: () => {
          // if endObservable fires, quit emitting
          subs.unsubscribe();
        },
      });

      return {
        unsubscribe: () => {
          subs.unsubscribe();
        },
      };
    });
  }

  map(mappingFunction) {
    const self = this;
    return new Observable(({ next, complete, error }) => {
      const subscription = self.subscribe({
        next: (val) => next(mappingFunction(val)),
      });

      return {
        unsubscribe: () => {
          subscription.unsubscribe();
        },
      };
    });
  }

  filter(predicate) {
    const self = this;
    return new Observable(({ next, complete, error }) => {
      const subscription = self.subscribe({
        next: (val) => {
          if (predicate(val)) {
            next(val);
          }
        },
      });
      return {
        unsubscribe: () => {
          subscription.unsubscribe();
        },
      };
    });
  }

  throttle(time) {
    const self = this;
    return new Observable(({ next, complete, error }) => {
      let id = null;

      const subscription = self.subscribe({
        next: (val) => {
          if (id) {
            clearTimeout(id);
          }
          id = setTimeout(() => {
            next(val);
          }, time);
        },
      });

      return {
        unsubscribe: () => {
          if (id) {
            clearTimeout(id);
          }
          subscription.unsubscribe();
        },
      };
    });
  }

  forEach(callback) {
    const self = this;
    return new Observable(({ next, complete, error }) => {
      self.subscribe({
        next: (val) => {
          callback(val);
          next(val);
        },
        complete: complete,
        error: error,
      });
    });
  }

  static timeout(time) {
    return new Observable(({ next, complete, error }) => {
      console.log("call timeout");
      const id = setTimeout(() => {
        next(time);
        if (complete) {
          complete(time);
        }
      }, time);

      return {
        unsubscribe: () => {
          clearTimeout(id);
        },
      };
    });
  }

  static of(value) {
    return new Observable(({ next, complete, error }) => {
      next(value);
      if (complete) {
        complete();
      }
      return {
        unsubscribe: () => {},
      };
    });
  }

  static concat(...observables) {
    return new Observable(({ next, complete, error }) => {
      let currentSubscription = null;

      const handleSubscription = (observables) => {
        const [currentObservable, ...rest] = observables;
        if (!currentObservable) {
          if (complete) {
            complete();
          }
          return;
        }
        currentSubscription = currentObservable.subscribe({
          next: (val) => {
            next(val);
          },
          complete: () => {
            // if observables completes subscribe to the next one
            handleSubscription(rest);
          },
          error: (err) => {
            if (error) {
              error(err);
            }
          },
        });
      };

      handleSubscription(observables);

      return {
        unsubscribe: () => {
          currentSubscription.unsubscribe();
        },
      };
    });
  }

  distinctUntilChange() {
    const self = this;
    return new Observable(({ next }) => {
      let prevValue = null;
      const subscription = self.subscribe({
        next: (currentValue) => {
          if (prevValue !== currentValue) {
            prevValue = currentValue;
            next(currentValue);
          }
        },
      });

      return {
        unsubscribe: () => {
          subscription.unsubscribe();
        },
      };
    });
  }

  static merge(...observables) {
    return new Observable(({ next }) => {
      observables.forEach((observable) => {
        observable.subscribe({
          next: (value) => {
            next(value);
          },
        });
      });

      return {
        unsubscribe: () => {
          observables.forEach((observable) => {
            observable.unsubscribe();
          });
        },
      };
    });
  }

  static fromArray(array) {
    return new Observable(({ next, complete, error }) => {
      array.forEach((val) => {
        next(val);
      });
      if (complete) {
        complete();
      }
    });
  }

  scan(reducer) {
    const self = this;
    return new Observable(({ next, complete }) => {
      let acc = null;
      const subs = self.subscribe({
        next: (curValue) => {
          if (acc === null) {
            acc = curValue;
          } else {
            acc = reducer(acc, curValue);
          }
          next(acc);
        },
        complete: () => {
          if (complete) {
            complete();
          }
        },
      });
      return {
        unsubscribe: () => {
          subs.unsubscribe();
        },
      };
    });
  }

  mergeAll() {
    return new Observable(({ next, complete }) => {
      this.subscribe({
        next: (observable) => {
          const currentSubscriptions = observable.subscribe({
            next: (val) => {
              next(val);
            },
          });
        },
      });
    });
  }

  share() {
    const subject = new Subject();
    this.subscribe(subject);
    return subject;
  }

  static fromPromise(promise) {
    return new Observable(({ next, complete, error }) => {
      let unsubscribed = false;
      promise.then((res) => {
        if (!unsubscribed) {
          next(res);
        }
      });
      return {
        unsubscribe: () => {
          unsubscribed = true;
        },
      };
    });
  }
}

export class Subject extends Observable {
  observers = [];

  constructor() {
    super((observer) => {
      this.observers.push(observer);
    });

    this.next = this.next.bind(this);
    this.complete = this.complete.bind(this);
    this.error = this.error.bind(this);
  }

  next(value) {
    [...this.observers].forEach(({ next }) => next(value));
  }

  complete() {
    [...this.observers].forEach(({ complete }) =>
      typeof complete === "function" ? complete() : null
    );
  }

  error(ex) {
    [...this.observers].forEach(({ error }) =>
      typeof error === "function" ? error(ex) : null
    );
  }
}
