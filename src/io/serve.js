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

io.on('connection', socket => {
  
  socket.on('thir/sentNum', data => {
 
    io.emit('thir/setAsyncList', {num: data.num})
    num += data.num

    io.emit('thir/changeNum', {num: num.toFixed(2),eventName:data.name,eventDetail:`摇出了 ${data.num}`})
    
  })
  socket.on('thir/restart', (data) => {
    num = data.num
    randomNum = getRandomNumber(23, 41)
    io.emit('thir/changeNum', {num: 0})
    io.emit('thir/resetList',{
      eventName:data.name,
      eventDetail:`重新开始了游戏`
    })
    io.emit('thir/setFirstNumber', {num: randomNum})

  })
  socket.on('thir/joinName', data=>{
    io.emit('thir/getLoginName', {eventName:data.name,eventDetail:'加入了游戏！'})
  })
  socket.on('thir/quiteGame', data =>{
    io.emit('thir/getLoginName', {
      eventName:data.name,
      eventDetail:`退出了游戏`
    })
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




function setGetReqOrigin(ctx){
  ctx.set("Access-Control-Allow-Origin",'*')

}
function setOptionsReq(ctx){
  ctx.set("Access-Control-Allow-Origin", 'http://localhost:3000')
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
  return Math.floor(Math.random() * (max - min + 1))
}