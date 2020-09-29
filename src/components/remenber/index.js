import React from 'react';

import './index.css'

export default (props)=>{

  return (<div className="rem-box">
    {
      props.list.map((ele, index)=>{
        return <p key={`${index}thisismykey`}>
           <span className="event-name">{`${ele.eventName} `}</span>
          <span >{`${ele.eventDetail} `}</span>
          
          </p>
      })
    }
  </div>)
}