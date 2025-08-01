import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import {clerkWebhooks} from './controllers/webhooks.js'
import bodyParser from 'body-parser'

const app = express()

await connectDB()

app.use(cors())

app.get('/', (req,res)=>res.send("API working"))
console.log("calling whook")
app.post('/clerk', express.json(), clerkWebhooks)
console.log("whook complete")
const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Server is runnning on port ${PORT}`)
})