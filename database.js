const { Pool } = require("pg")

const pool = new Pool({
    user : "",
    password : "",
    host : "localhost",
    port : 3307,
    database : "lawnsoor_test",
    max : 5,
})

async function getConnDb () {
    try {
        return await pool.connect()
    } catch (err) {
        console.log("dbcon : " + err.message)
        return false
    }
}

async function getUsers() {
    const dbConn = await getConnDb()
    if (!dbConn) return false
    try {
        await dbConn.query("begin")
        const { rows } = await dbConn.query("select * from users")
        await dbConn.query("commit") 
        return rows
    } catch (error) {
        console.log(error.message)
        await dbConn.query("rollback")
        return false
    } finally {
        dbConn.release()
    }
}

async function getUser(id) {
    const dbConn = await getConnDb()
    if (!dbConn) return false
    try {
        await dbConn.query("begin")
        const { rows } = await dbConn.query("select * from users where id = $1", [id])
        await dbConn.query("commit") 
        return rows
    } catch (error) {
        console.log(error.message)
        await dbConn.query("rollback")
        return false
    } finally {
        dbConn.release()
    }
}

module.exports = { getUsers, getUser }