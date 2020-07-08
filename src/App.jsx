import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {Observable} from "./Observable";


export const mouseMove$ = Observable.fromEvent(document, 'mousemove')

export const resize$ = Observable.fromEvent(window, 'resize')


function App() {
  useEffect(() => {
    resize$
      .map((e) => ({
        width: e.target.innerWidth,
        height: e.target.innerHeight
      }))
      .subscribe((e) => {
        console.log('resize: ', e)
    })
  }, [])

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
      mouseMove$.unsubscribe()
    }
  }, [])
  return (
    <div className="App">

    </div>
  );
}

export default App;
