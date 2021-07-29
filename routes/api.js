const { Router } = require('express')

const Database = require('./../database')

const api = Router()

api.get('/room/:id', async (req, res) => {
  try {
    const roomDb = new Database('media-stream')

    const doc = await roomDb.findOne({ room_key: req.params.id })

    res.json({
      online: !!doc,
      message: !!doc ? '' : 'Room not found'
    })
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Internal error'
    })
  }
})

module.exports = api
