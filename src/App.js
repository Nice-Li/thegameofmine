import React, {useEffect, useReducer, useState} from 'react';
import './App.css';

import state from './store/state'
import reducer from './store/reducer'
import {loginAction} from './store/actions'

import NavRoute from './router/index'

import getName from './until/getRandomName'

const name = getName()
sessionStorage.setItem('name', name)




function App() {
  const [login, loginDispatch] = useReducer(reducer, state)
  const [, setUpdate] = useState({})
  useEffect(()=>{
    setTimeout(()=>{
      loginDispatch({type:loginAction, payload:{name:name}})
      setUpdate({})
    },1000)

  },[])

  return (
    <div className="App">

      <section className="App-main">
      <NavRoute ></NavRoute>
      </section>
      <footer className="App-footer">{login.name}</footer>
    </div>
  );
}

export default App;
