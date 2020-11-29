
const firstList = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

const lastList = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']

// const numberList = [1,2,3,4,5,6,7,8,9,0]

function randomName (min, max){
  return Math.floor(Math.random() * (max - min ))
}

export default function getName(){
  let firstName = firstList[randomName(0, 26)]
  let lastName = ''
  for(let i = 0; i < 2; i ++){
    let num = randomName(0, 26)
    lastName += lastList[num]
  }
  return `${firstName}${lastName}`
}