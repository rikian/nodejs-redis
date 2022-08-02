const app = require("express")()
const cookieParser = require('cookie-parser')
const { getUser } = require("./database")
app.use(cookieParser())
var redisConnection = false

app.get("/user", async (req, res) => {
    const id = req.cookies["id"]
    if (!id) return res.json({message : `bad request`})
    try {
        // get data from redis server if redisConnection exist!!
        if (redisConnection) {
            let user = await redisPull(id)

            // get data from db
            if (user === null || !user) {
                user = await getUser(id)
                if (user.length !== 1) return res.json({message : `user not found`})
                await redisPush({id : user[0]["id"], first_name : user[0]["first_name"]})
                res.json({message : `hello ${user[0]["first_name"]}... this is message from db`})
                return
            }

            res.json({message : `hello ${user}... this message is from cache`})
            return
        }

        // get data from db if redisConnection not exist!!
        const dbuser = await getUser(id)
        if (dbuser.length !== 1) return res.json({message : `user not found`})
        res.json({message : `hello ${dbuser[0]["first_name"]}... this is message from db`})
    } catch (err) {
        console.log(err)
        res.json({message : `something wrong...`})
    }
})

app.listen(1234, async () => {
    try {
        console.log("app running...")
        await redisClient.connect()
    } catch (error) {
        console.log(error.message)   
    }
})

// redis server
const { createClient } = require("redis")
const redisClient = createClient(6379, "127.0.0.1")
redisClient.on("connect", () => {
    console.log("create connection to redis server...")
})

redisClient.on("ready", () => {
    console.log("connection ready...")
    redisConnection = true
})

redisClient.on("reconnecting", () => {
    console.log("reconect to redis server...")
})

redisClient.on("end", () => {
    console.log("disconected from redis server...")
})

redisClient.on("error", (err) => {
    console.log(err.message)
    redisConnection = false
})

async function redisPush(user) {
    try {
        await redisClient.setEx(user["id"], 3600, user["first_name"])
        return true
    } catch (error) {
        console.log(error.message)
        return false
    }
}

async function redisPull(id) {
    try {
        return await redisClient.get(id)
    } catch (error) {
        console.log(error.message)
        return false
    }
}