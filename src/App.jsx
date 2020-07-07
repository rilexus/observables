import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';


class Observable {
  constructor(subscriber) {
    // save function to call it latter
    this._subscriber = subscriber
  }

  subscribe(next, error, complete){
    // call the previous saved function only if subscribe was called. dont do anything if not subscribe
    return this._subscriber(next, error, complete)
  }

  static fromEvent(domElement, eventName) {
    return new Observable((next, error, complete) => {
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
    return new Observable((next, error, complete) => {
      const subscription = self.subscribe((val) => next(mappingFunction(val)))
    })
  }

  filter(predicate){
    const self = this
    return new Observable((next, error, complete) => {

      const subscription = self.subscribe((val) => {
        if (predicate(val)){
          next(val)
        }
      })
    })
  }

  throttle(time){
    const self = this
    return new Observable((next) => {
      let id = null

      self.subscribe((val) => {
        if(id) {
          clearTimeout(id)
        }
        id = setTimeout(() => {
          next(val)
        }, time)

      })
    })
  }
}


export const mouseMove$ = Observable.fromEvent(document, 'mousemove')

function App() {
  useEffect(() => {
    const mouseMoveObserver = (val) => {
      console.log(val)
    }

    mouseMove$
      .map(moveEvent => moveEvent.clientX) // get x pos from mouse move event
      .filter((x) => x > 500) // fire only when mouse is over 500px at screen
      .throttle(100) // return the x position only after the user has stopped moving for 100ms. to prevent map and filter to be called all the time, move this on top
      .subscribe(mouseMoveObserver)
    return () => {
      mouseMove$.subscribe()
    }
  }, [])
  return (
    <div className="App">

    </div>
  );
}

export default App;
