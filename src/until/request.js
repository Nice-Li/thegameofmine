import Axios from 'axios'



export default Axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 1000,
})