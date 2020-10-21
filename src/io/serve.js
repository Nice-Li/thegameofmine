const Koa = require('koa')
const Socket = require('socket.io')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const app = new Koa()
app.use(bodyParser())

const server = require('http').createServer(app.callback())


const Shudu = require('./shudu')

const io = Socket(server)

let num = 0
let randomNum = 23;

// card section
let joinCardNumber = null;
let originCards = getOriginCards().concat(getOriginCards())
let cardsList = []
let cardUser = []


io.on('connection', socket => {
  
  socket.on('thir/getNum', data => {
    let detail = null;
    
    num += data.num
    if(num >= randomNum){
      detail = `触发了本次节点！！！`
    }else{
      detail = `摇出了 ${data.num}`
    }
    io.emit('thir/setNum', {
      num: num.toFixed(2),
      eventName:data.name,
      eventDetail:detail,
      originNum:data.num,
      resolteNum:randomNum
    })
    
  })
  socket.on('thir/restart', (data) => {
    num = data.num
    randomNum = getRandomNumber(13, 31)
    console.log(randomNum)
    io.emit('thir/restart',{
      eventName:data.name,
      eventDetail:`重新开始了游戏`,
      originNum:0,
      resolteNum:randomNum
    })


  })
  socket.on('thir/joinName', data=>{
    io.emit('thir/getLoginName', {
      eventName:data.name,
      eventDetail:'加入了游戏！',
      resolteNum:randomNum
    })
  })
  socket.on('thir/quiteGame', data =>{
    io.emit('thir/getLoginName', {
      eventName:data.name,
      eventDetail:`退出了游戏`
    })
  })

  socket.on('crads/start', data => {
    let len = cardUser.length
    if(len < 2){
      io.emit('cards/error', {errorMsg:'游戏人数少于2人，不能开启游戏...'})
    }else if(len > 7){
      io.emit('cards/error', {errorMsg:'参与游戏人数过多，请矜持...'})
    }else{
      cardsList = getArrRandomList(originCards)
      let list = []
      cardUser = getArrRandomList(cardUser)
      cardUser.forEach((ele, index)=>{
        list.push({
          userId:index,
          userName:ele.userName,
          card:cardsList.splice(0, (5 - ele.cardsCount))
        })
        ele.cardsCount = 5
      })

      io.emit('cards/startGame', {
        list:list
      })
    }
  })
  socket.on('cards/passMyTurn', data=>{
    if(data.passCount){
      cardUser.forEach(ele=>{
        if(ele.userName === data.user){
          ele.passCount = data.passCount
        }
      })
    }

    if(cardUser.every(ele=>{
      return ele.passCount
    })){
      // gameover
      io.emit('cards/gameOver', {
        isGameOver:true
      })
      // cardsList  
      return 
    }
    let turn = null
    if(data.youIndex + 1 >= cardUser.length){
      turn = 0
    }else{
      turn = data.youIndex + 1
    }

    io.emit('cards/setYouTurn', {
      turnIndex:turn,
      userName:data.user
    })
  })
  socket.on('cards/change', data=>{
    let turn = null
    cardUser.forEach(ele=>{
      if(ele.userName === data.user){
        ele.cardsCount -= 1;
      }
    })

    if(data.youIndex + 1 >= cardUser.length){
      turn = 0
    }else{
      turn = data.youIndex + 1
    }
    io.emit('cards/setShowCard', {
      card:data.card,
      turnIndex:turn,
      cardColor:data.cardColor
    })
  })
  socket.on('cards/haveNewCards', data=>{
    let len = cardsList.length;
    let card = null
    if(len > 0 && len <= 5){
      card = cardsList.splice(0, len)
    }else if(len === 0){
      card = []
    }else{
      card = cardsList.splice(0, 5)
    }
    cardUser.forEach(ele=>{
      if(ele.userName === data.user){
        ele.cardsCount = 5
      }
    })
    socket.emit('cards/giveNewCards', {
      card

    })
  })
  socket.on('cards/giveUp', data=>{

    cardUser.forEach(ele=>{
      if(ele.userName === data.user){
        ele.cardsCount -= 1;
      }
    })

    let turn = null;
    if(data.youIndex + 1 >= cardUser.length){
      turn = 0
    }else{
      turn = data.youIndex + 1
    }

    let index = data.youIndex;

    let list = []
    let newArr = cardUser.slice(index).concat(cardUser.slice(0, index))

    newArr.forEach(ele=>{

      let len = cardsList.length;
      let card = null
      if(len > 0 && len <= (5-ele.cardsCount)){
        card = cardsList.splice(0, len)
      }else if(len === 0){
        card = []
      }else{
        card = cardsList.splice(0, 5-ele.cardsCount)
      }
      ele.cardsCount = 5
      list.push({
        userName:ele.userName,
        card:card,
        turnIndex:turn
      })
    })
    io.emit('cards/getNewCards', {list:list})
  })
})




let router = new Router()


router.get('/getShudu', ctx=>{
  setGetReqOrigin(ctx)

  // console.log(Shudu.createNum(new Array(81)))
  ctx.body = Shudu.createNum(new Array(81))
})
.options('/getNewShuduList', ctx=>{
  setOptionsReq(ctx)
  console.log('options running')
  ctx.body = null
})
.post('/getNewShuduList', ctx=>{
  setGetReqOrigin(ctx)
// ctx.request.body.params
  let list = ctx.request.body.list
  let newList = list.map(ele=>{
    return ele.num
  })
  
  ctx.body = Shudu.createNum(newList) 
})
.options('/joinCard', ctx=>{
  setOptionsReq(ctx)
  ctx.body = null
})
.post('/joinCard', ctx =>{
  setGetReqOrigin(ctx)
  let userName = ctx.request.body.user
  let flag = cardUser.some(ele=>{
    if(ele.userName === userName){
      return true
    }
    return false
  })
  if(!flag){
    cardUser.push({
      userName:ctx.request.body.user,
      cardsCount:0
    })
  }
  
  ctx.body = 'ok'
})



function setGetReqOrigin(ctx){
  ctx.set("Access-Control-Allow-Origin",'*')

}
function setOptionsReq(ctx){
  ctx.set("Access-Control-Allow-Origin", '*')
  ctx.set("Access-Control-Allow-Methods", " GET, OPTIONS, POST");
  ctx.set('Access-Control-Allow-Headers','content-type')
  ctx.set("Access-Control-Max-Age", "2592000");
  // ctx.set('Access-Control-Allow-Credentials', 'true')
}

app.use(router.routes());
// 处理405 501
app.use(router.allowedMethods());
server.listen('8080',()=>{console.log('8080 running')})



function getRandomNumber(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getOriginCards(){
  let origin = [];

  ['c', 'd', 'h', 's'].forEach((ele, index)=>{
    for(let i = 6 ; i < 11; i ++ ){
      origin.push({
        cardNum:i,
        cardColor:ele
      })
    }
  })

  origin.push({
    cardNum:0,
    cardColor:'big'
  },{
    cardNum:0,
    cardColor:'small'
  })

  return origin
}

function getArrRandomList(arr){
  let newArr = arr.concat([])
  let len = newArr.length;
  let numArr = []
  for(let i = 0; i < len; i ++){
    let num = Math.floor(Math.random() * newArr.length ) 

    numArr.push(newArr.splice(num, 1))
  }

  return numArr.flat()
}


function getOriginCardsLast(){
  let origin = [];

  ['c', 'd', 'h', 's'].forEach((ele, index)=>{
    for(let i = 1 ; i < 14; i ++ ){
      origin.push({
        cardNum:i,
        cardColor:ele
      })
    }
  })

  origin.push({
    cardNum:0,
    cardColor:'big'
  }, {
    cardNum:0,
    cardColor:'big'
  },{
    cardNum:0,
    cardColor:'small'
  },{
    cardNum:0,
    cardColor:'small'
  })

  return origin
}