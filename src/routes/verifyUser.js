const express = require('express')
const router = express.Router()
const userDb = require('../model/Users.json')
router.post('/', (req,res) => {
    try{
    const {username} = req.body
    if(!username) return res.status(400).json({msg: "Username cannot be blank"})
    const user = userDb.find(user => user.username === username)
    if(!user) return res.sendStatus(404)
    res.status(200).json({ message: 'User exists' })
    }
    catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})
module.exports = router