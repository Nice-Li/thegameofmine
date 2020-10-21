import React, { useState, useEffect } from 'react';

import socket from '../../until/socket'
import state from '../../store/state'
import request from '../../until/request'

import './index.css'




export default ()=>{
  const [, setUpdate] = useState({})
  const [isJoin, setIsJoin] = useState(false)
  const [card, setCard] = useState([])
  const [userList, setUserList] = useState([])
  const [isGameover, setGameOver] = useState(true)
  const [isYouTurn, setYouTurn] = useState(false)
  const [showCard, setShowCard] = useState({
    cardNum:0,
    cardColor:0
  })
  const [seletectCard, setSeletectCard] = useState()
  const [youIndex, setYouIndex] = useState()
  const [selectCardIndex, setSelectCardIndex] = useState(null)
  const [errorTips, setErrorTips] = useState(null)
  const [cardColor, setCardColor] = useState(null)
  const [changeCardColor, setChangeCardColor] = useState(false)
  const [passCount, setPassCount] = useState(0)
  const [flag, setFlag] = useState(false)

  useEffect(()=>{
    
    socket.on('cards/startGame', data => {
      let resCard = data.list.filter(ele=>{
        if(ele.userName === state.name){
          setGameOver(false)

          return true;
        }
        return false
      })

      setCard(resCard[0].card)
      setYouIndex(resCard[0].userId)

      if(resCard[0].userId === 0){
        setYouTurn(true)
      }
      setUserList(data.list.filter(ele=>{
        if(ele.userName !== state.name){
          return true
        }
        return false
      }))
    })

    

    socket.on('cards/error', data=>{
      setErrorTips(data.errorMsg)
    })

    socket.on('cards/gameOver', data=>{
      if(data.isGameOver){
        setGameOver(true)
      }
    })
  },[])

  useEffect(()=>{

    socket.on('cards/setShowCard', data => {
      // setTurnIndex(data.turnIndex)
      
      if(youIndex === data.turnIndex){
        setYouTurn(true)
      }else{
        setYouTurn(false)
      }
      setShowCard(data.card)
      setCardColor(data.cardColor)

    })
    socket.on('cards/getNewCards', data => {
      
      let res = data.list.filter(ele=>{
        if(ele.userName === state.name){
          return true
        }
        return false
      })
      if(youIndex === res[0].turnIndex){
        setYouTurn(true)
      }else{
        setYouTurn(false)
      }

      setCard(l => {
        let arr =  l.concat(res[0].card)
        if(arr.length === 0){
          socket.emit('cards/passMyTurn', {
            user:state.name,
            youIndex:youIndex,
            passCount:passCount
          })
        }

        return arr
      })
    })

    socket.on('cards/setYouTurn', data=>{
      if(youIndex === data.turnIndex){
        setYouTurn(true)
      }else{
        setYouTurn(false)
      }
    })

    socket.on('cards/giveNewCards', data=>{
      if(data.card.length === 0){
        // setGameOver(true)
        socket.emit('cards/passMyTurn', {
          user:state.name,
          youIndex:youIndex,
          passCount:passCount
        })
        return
      }
      setCard(data.card)
    })

    return ()=>{
      socket.off('cards/giveNewCards')
      socket.off('cards/setShowCard')
      socket.off('cards/getNewCards')
      socket.off('cards/setYouTurn')
    }
  },[youIndex, passCount])

  return <div className="card-sec">
    <div className="drogon-main">
      <div className={`card-box color_${cardColor}`}  >
               
            <div className="card-top">
              {userList.map((ele, index)=>{
                return (
                  <div key={index} className="card-list">
                    <h3>{ele.userName}</h3>
                    <div className="bg-box">
                      <img src={`http://www.zxyow.com/images/cards/nice_0.png`} alt=""/>
                    </div>
                  </div>
                )
              })}
              

            </div>
          


        <div className="card-middle">
          <img src={`http://www.zxyow.com/images/cards/nice_${`${showCard.cardNum}_${showCard.cardColor}`}.png`} alt=""/>
        </div>

        { 
          changeCardColor ? 
          <div className="color-btn">
            {
              [{title:'梅花', nick:'c'},{title:'方片',nick:'d'},{title:'红桃',nick:'h'},{title:'黑花',nick:'s'}].map((ele, index)=>{       
                return (<button key={index} onClick={()=>{
                  // 1.改变花色class
                  let res = card.splice(selectCardIndex, 1)
                  setCardColor(ele.nick)
                  
                  socket.emit('cards/change', {
                    card:res[0],
                    youIndex:youIndex,
                    user:state.name,
                    cardColor:ele.nick
                  })
                  setChangeCardColor(false)

                }}>{ele.title}</button>)
              })
            }
              
            
          </div> : ''
          }

        <div className="card-bottom">
          {
            isYouTurn ? (
            <div className="btn-list">
              <button onClick={()=>{
                if(!flag){
                  setErrorTips('请先选择卡牌！')

                  return 
                }
                if(seletectCard.cardNum === 11 || seletectCard.cardNum === showCard.cardNum || seletectCard.cardNum === 0){
                  setChangeCardColor(true)
                  
                  return 
                }
                if( cardColor && cardColor !== seletectCard.cardColor){
                  setErrorTips('所选卡牌不满足出牌条件！')
                  return 
                }
                
                let res = card.splice(selectCardIndex, 1)
                setFlag(false)
                
                socket.emit('cards/change', {
                  card:res[0],
                  youIndex:youIndex,
                  user:state.name,
                  cardColor:res[0].cardColor
                })

                if(card.length === 0){
                  // 当出牌后 卡牌 为0 自动摸牌
                  socket.emit('cards/haveNewCards', {
                    user:state.name,

                  })
                }

              }}>出牌</button>
              <button onClick={()=>{
                if(!flag){
                  setErrorTips('请先选择卡牌！')
                  return 
                }
                let res = card.splice(selectCardIndex, 1)
                setPassCount(n=>{
                  return n + res[0].cardNum
                  
                })
                setFlag(false)
                
                socket.emit('cards/giveUp', {
                  youIndex:youIndex,
                  user:state.name,

                })
              }}>弃牌</button>
              <button></button>
          </div> ) : (
            ''
          )
          }
          
          {
            isJoin&& !isGameover ? (

              <ul>
                { card.map((ele, index) =>{
                  return (<li className={selectCardIndex === index ? 'active' : ''} onClick={(e)=>{
                    
                    setFlag(true)
                    
                    setSeletectCard(ele)
                    setSelectCardIndex(index)
                  }} key={index}>
                    <img src={`http://www.zxyow.com/images/cards/nice_${ele.cardNum}_${ele.cardColor}.png`} alt=""/>
                  </li>)
                }) }
              </ul>
              
            ) : (
              <p>请参加游戏，或等待当前游戏结束...</p>
            )
          }
          
          <h3>{`title`}</h3>
          <p>{errorTips}</p>
          {
            isJoin ? (
              <button className="restart-box" onClick={()=>{
                if(isGameover){
                  socket.emit('crads/start')
                  return
                }
                return false;
              }}>
                {isGameover ? `开始游戏` :`游戏进行中...`}
          </button>
            ) : (
              <button className="join-box" onClick={()=>{
                
                request.post('/joinCard', {
                  user:state.name,
                  
                }).then(val=>{
                  if(val.data === 'ok'){
                    setIsJoin(true)
                  }
                })
              }}>
                加入游戏
          </button>
            )
          }
          
        </div>
      
      </div>

    </div>
    
  </div>
}