import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {Observable} from "./Observable";


export const mouseMove$ = Observable.fromEvent(document, 'mousemove')

export const resize$ = Observable.fromEvent(window, 'resize')

const time200 = Observable.timeout(200)
const time500 = Observable.timeout(500)
const time1000 = Observable.timeout(1000)
const time$ = Observable.concat(time200, time500, time1000)


const subs = time$.subscribe((time) => {
  console.log('time: ', time)
})

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
