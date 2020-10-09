import React, {useState, useEffect, useReducer} from 'react'
import './index.css'

import Tips from '../../components/tips/index'

import request from '../../until/request'
import state from '../../store/state'
import reducer from '../../store/reducer'
import {setNumList, setUserNumList} from '../../store/actions'

// import getRandomIndex from '../../until/getRandomIndex'
// import getRandomList from '../../until/getRandomList'
// import getOriginIndex from '../../until/getOriginIndex' 
import getUserShuduList from '../../until/getUserShuduList'
import getCompareResult from '../../until/getCompareResult'
import getTipsIndex from '../../until/getTipsIndex'
import getListCheckResult from '../../until/getListCheckResult'
const numArr = [0,1,2,3,4,5,6,7,8,9]
const myKeyStr = 'shudupage'


// function getUserShuduList(arr, count){
//   let NArr = arr.concat([])
//   return getRandomList(NArr, getRandomIndex(getOriginIndex(81), count) )
// }


export default ()=>{

  const [showTips, setShowTips] = useState('')
  const [showCount, setShowCount] = useState(51)
  const [showNum, setShowNum] = useState(1)
  const [resList, setResList] = useState([])
  const [shuduLastList, setShuduDispatch] = useReducer(reducer, state)


  useEffect(()=>{
    if(shuduLastList.userNumList){
      setResList(shuduLastList.userNumList)
    }else{
      request.get('/getShudu').then((val)=>{
        let userNumList = getUserShuduList(val.data, showCount)
        setShuduDispatch({type:setNumList, payload:{
          numList:val.data,
          userNumList:userNumList
        }})
        setResList(userNumList)
      })
       
    }
  }, [])

  useEffect(()=>{
    setShuduDispatch({type:setUserNumList, payload:{
      userNumList:resList
    }})

    let resFlag = resList.length !== 0 && resList.every(ele=>{
      return !!ele.num
    })

    if(resFlag){
      // true 填写完毕
      let newList = resList.map(ele=>{
        return ele.num
      })
      let res = getListCheckResult(newList)
      res && setShowTips('success')
    }
   


  }, [resList])


  return <div className='app-content'>
    <h2>数 独</h2>
    <p className='number-box' onClick={(e)=>{
      if(+e.target.textContent){
        setShowNum(+e.target.textContent)
      }else{
        setShowNum(0)
      }
    }}>
      {
        numArr.map(ele=>{
          if(ele === 0){
            return <span className={ele === showNum ? 'active' : ''} key={`${ele}-${myKeyStr}`}>{`删`}</span>
          }
          return <span className={ele === showNum ? 'active' : ''} key={`${ele}-${myKeyStr}`}>{ele}</span>
        })
      }
    </p>
    <div className="main" >
      {
        resList.map((ele, index)=>{
          // 需要判断 disable
          return <div className={
            `main-item ${ele.disable? 'disable' :'active'}`
          }  onClick={()=>{
            if(ele.disable){
              return 
            }
            setResList(l=>{
              l.splice(index, 1, showNum === 0? {
                num:'',
                disable:false
              } : {
                num:showNum,
                disable:false
              })
              return l.concat([])
            })
            
          }} key={`${ele.num}--${myKeyStr}${index}`}>{ele.num}</div>
        })
      }
    </div>
    {/* btn section */}
    <div className='btn-box'>
      <input onInput={(e)=>{
        let value = parseInt(+e.target.value)

        if(value <= 81 && value >=0){
          let num = Math.abs(value - 81)
          let  list = shuduLastList.numList.concat([]);
          let resVal = getUserShuduList(list, num)

          setShowCount(num)
          setResList(resVal)
        }else{
          return 
        }
         
        
      }} placeholder={`请输入需要显示的数字个数`} />

      <button onClick={async ()=>{
        let val = await request.get('/getShudu')

        let resVal = getUserShuduList(val.data, showCount)
        setShuduDispatch({type:setNumList, payload:{
          numList:val.data
        }})
        setResList(resVal)
      }}>新游戏</button>



      

      <button onClick={()=>{
        // 查询是否还有空值
        let index = getTipsIndex(resList)
        if(!index && index !== 0) return
        // 查询原数独

        let flag = getCompareResult(shuduLastList.numList, resList)
        // 判断用户是否又写入出错
        console.log(flag)
        if(flag){
          // 是原数独 改变resList即可
          
          setResList(l=>{
            l.splice(index, 1, {
              num:shuduLastList.numList[index],
              disable:true
            })
            return l.concat([])
          })
        }else{
          // 与原数独不匹配
          request.post('/getNewShuduList', {list:resList}).then(val=>{
            
            if(val.data){
              let originIndex = []
              // 与原list对比渲染
              resList.forEach((ele, index)=>{
                if(ele.disable){
                  originIndex.push(index)
                }
              })


              let userNumList = getUserShuduList(val.data, showCount, originIndex)
              setShuduDispatch({type:setNumList, payload:{
                numList:val.data,
                userNumList:userNumList
              }})
              
              setResList(l=>{
                l.splice(index, 1, {
                  num:shuduLastList.numList[index],
                  disable:true
                })
                return l.concat([])
              })
            }else{
              setShowTips('getWrong')
            }
          })
        }
        // 没有错误且不匹配原数独生成新数独

      }}>提示一次</button>
    </div>
    
    <div className='showWrongBox' onClick={()=>{
      setShowTips('')
    }}>
      <Tips tips={showTips}></Tips>
    </div> 
  </div>
}