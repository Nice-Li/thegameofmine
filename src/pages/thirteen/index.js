import React,{useState, useEffect, useReducer} from 'react'
// import socket from '../../until/socket'
import './index.css'
import RemBox from '../../components/remenber/index'
import io from 'socket.io-client'

import state from '../../store/state'
import reducer from '../../store/reducer'



function getANumber(min, max, step=0.5){
  return Math.round(Math.random() * (max - min + step) * 100 ) / 400
}

const socket = io('ws://localhost:8080')

export default (props)=>{

  const [randomNum, setRandomNum] = useState(0)
  const [isJoin, setJoin] = useState(false)
  const [num, setNum ] = useState(0)
  const [list, setList] = useState([])
  const [remList, setRemList] = useState([])
  const [login, ] = useReducer(reducer, state)

  useEffect(()=>{
    

    socket.addEventListener('thir/setNum', data=>{
      setRemList(l=>{
        
        let r = l.concat([])
        r.unshift(data)
        return r
      })
      setNum(data.num)
      setRandomNum(data.resolteNum)
      setList(l=>{
        return l.concat(data.originNum)
      })
    })

    socket.addEventListener('thir/restart', (data)=>{
      setList([])
      setRemList([{
        eventName:data.eventName,
        eventDetail:data.eventDetail
      }])
      setNum(data.originNum)
      setRandomNum(data.resolteNum)
    })
    socket.on('thir/getLoginName', data=>{
      setRemList(l=>{
        return l.concat(data)
      })
      setRandomNum(data.resolteNum)
    })
    return ()=>{
      if(isJoin){
        socket.emit('thir/quiteGame', {name:login.name})
      }
      socket.removeAllListeners()
    }
  },[])



  return <>
    <p className="number-show">{num}</p>

    <p>{
      list.map((ele, index)=>{
        if(list.length - 1 === index){
          return <span key={index}>{ele}</span>
        }else{
          return <span key={index}>{ele} + </span>
        }
      }
      )}</p>
    <div className='btn-box'>
    
    {isJoin ? 
    <>
      <button className='btn-click' onClick={
        ()=>{
          if(num >= randomNum){
            return 
          }
          let RNum = getANumber(num, randomNum, 1)
          socket.emit('thir/getNum', {num:RNum, name:login.name})
        }
      }>click</button>

      <button className='btn-click' onClick={
        ()=>{
          socket.emit('thir/restart', {num:0,name:login.name})

        }
      }>restart</button>
    </>

    : 
    <button className='btn-click' onClick={()=>{
      setJoin(true)
      socket.emit('thir/joinName', {name:login.name})
    }}>{`${login.name} join`}</button>
    }
    </div>

    <RemBox list={remList} />

  </>
}