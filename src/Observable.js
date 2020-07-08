export class Observable {
  constructor(subscriber) {
    // save function to call it latter
    this._subscriber = subscriber
  }

  subscribe(next, error, complete){
    // call the previous saved function only if subscribe was called. dont do anything if not subscribe
    return this._subscriber(next, error, complete)
  }

  static fromEvent(domElement, eventName) {
    return new Observable((next, complete, error) => {
      // call observer.next on every event call
      domElement.addEventListener(eventName, next)

      return {
        unsubscribe: () => {
          domElement.removeEventListener(eventName, next)
        }
      }
    })
  }

  map(mappingFunction){
    const self = this
    return new Observable((next, complete, error) => {
      const subscription = self.subscribe((val) => next(mappingFunction(val)))

      return {
        unsubscribe: () => {
          subscription.unsubscribe()
        }
      }
    })
  }

  filter(predicate){
    const self = this
    return new Observable((next, complete, error,) => {

      const subscription = self.subscribe((val) => {
        if (predicate(val)){
          next(val)
        }
      })
      return {
        unsubscribe: () => {
          subscription.unsubscribe()
        }
      }
    })
  }

  throttle(time){
    const self = this
    return new Observable((next,complete, error) => {
      let id = null

      const subscription = self.subscribe((val) => {
        if(id) {
          clearTimeout(id)
        }
        id = setTimeout(() => {
          next(val)
        }, time)
      })

      return {
        unsubscribe: () => {
          if(id) {
            clearTimeout(id)
          }
          subscription.unsubscribe()
        }
      }
    })
  }

  static timeout(time){
    return new Observable((next, complete, error) => {
      const id = setTimeout(() => {
        next(time)
        if (complete) {
          complete(time)
        }
      }, time)

      return {
        unsubscribe: () => {
          clearTimeout(id)
        }
      }

    })

  }

  static concat(...observables){
    return new Observable((next, complete, error) => {
      let currentSubscription  = null

      const handleSubscription = (observables) => {
        const [currentObservable, ...rest] = observables
        if (!currentObservable) {
          if(complete){
              complete()
          }
          return
        }
        currentSubscription = currentObservable.subscribe(
          (val) => {
            next(val)
          },
          () => {
            // if observables completes subscribe to the next one
            handleSubscription(rest)
          },
          (err) => {
            if(error){
              error(err)

            }
        })
      }

      handleSubscription(observables)

      return {
        unsubscribe: () => {
          currentSubscription.unsubscribe()
        }
      }

    })
  }
}