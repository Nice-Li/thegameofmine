import React from 'react';

import './index.css'



export default ()=>{


  return <div className="card-sec">
    <div className="drogon-main">
      <div className="card-box" >
          
      
    {[1,2,3,4,5].map((ele,index)=>{

      return (
        <div className="card" key={index}>
          <ul className="card-list">
              <li>1</li>
              <li>2</li>
              <li>3</li>
              <li>4</li>
          </ul>
          <h3>{`title`}</h3>
        </div>
      )
    })}
      
      </div>

    </div>
    <div className="drogon-rules">
      <div className="btn">
        <button className="join-btn">参加游戏</button>
      </div>
    </div>
  </div>
}