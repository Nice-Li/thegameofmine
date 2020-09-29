import React , {useState} from 'react'
import {BrowserRouter as Router, NavLink, Route, Switch} from 'react-router-dom'
import './index.css'
import Thirteen from '../pages/thirteen/index'
import Shudu from '../pages/shudu/index'
import CDrogon from '../pages/colorDrogon/index'
export default (props)=>{
  const [linkState, ] = useState([
    {link:'/shudu', name:'数独'},
    {link:'/thirteen', name:'十三点'},
    {link:'/colorDrogon', name:'变色龙'},

  ])


  return <>
    <Router>
      <div className="link-bg">
        {
          linkState.map((ele, index)=>{
            return <NavLink className={`btn-link`} key={index} to={ele.link}>{ele.name}</NavLink>
          })
        }

      </div>


      <Switch>
        <Route exact path='/thirteen' component={Thirteen}/>
        <Route exact path='/shudu' component={Shudu}/>
        <Route exact path='/colorDrogon' component={CDrogon}/>

      </Switch>

      
    </Router>
  </>
}