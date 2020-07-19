import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {Observable, Subject} from "./Observable";


export const mouseMove$ = Observable.fromEvent(document, 'mousemove')

export const resize$ = Observable.fromEvent(window, 'resize')


const userMouseMove$ = mouseMove$
  .map(moveEvent => moveEvent.clientX) // get x pos from mouse move event
  .filter((x) => x > 500) // fire only when mouse is over 500px at screen
  .throttle(200) // return the x position only after the user has stopped moving for 100ms. to prevent map and filter to be called all the time, move this on top

// const mult = Observable
//   .fromArray([1,2,3])
//   .map((val) => Observable.of(val))
//   .mergeAll()
//   .subscribe({
//     next:(val) => {
//       console.log(val)
//     }
//   })

// const time = Observable.timeout(1000).share()
//
// time.subscribe({next: () => {
//     console.log('DONE')
//   }})
// time.subscribe({next: () => {
//     console.log('DONE')
//   }})

const sub = new Subject()

sub.subscribe({next: (v) => {
    console.log(v)
  }})

sub.subscribe({next: (v) => {
    console.log(v)
  }})
sub.subscribe({next: (v) => {
    console.log(v)
  }})

sub.next(42)

function App() {
  // useEffect(() => {
  //   resize$
  //     .map((e) => ({
  //       width: e.target.innerWidth,
  //       height: e.target.innerHeight
  //     }))
  //     .subscribe((e) => {
  //       console.log('resize: ', e)
  //   })
  // }, [])


  useEffect(() => {
    const mouseMoveObserver = (val) => {
      console.log(val)
    }

    userMouseMove$
      .subscribe({next: mouseMoveObserver})
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
