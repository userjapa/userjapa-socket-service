const io = require('socket.io')

const Database = require('./../database')

const roomDb = new Database('media-stream')

module.exports = app => {
  const room = io(app, { path: '/socket/media-stream' })

  room.on('connection', socket => {
    let timeout = null

    socket.on('keep_alive', () => {
      if (timeout)
        clearTimeout(timeout)

      timeout = setTimeout(() => {
        socket.disconnect()
      }, 7500)
    })

    socket.on('create', async ({ type, room_key }) => {
      try {
        if (!['stream', 'conference'].includes(type))
          throw Error('Incorrect room type')

        if (type == 'conference') {
          const doc = await roomDb.insert({
            room_key,
            type,
            members: [ socket.id ]
          })

          socket.emit('room_created')
        } else {
          const doc = await roomDb.insert({
            room_key,
            type,
            owner: socket.id,
            members: [ socket.id ]
          })

          socket.emit('room_created')
        }
      } catch (error) {
        socket.emit('create_failed')
        console.log(error)
      }
    })

    socket.on('join', async room_key  => {
      try {
        const doc = await roomDb.findOne({ room_key })

        if (!doc)
          throw Error('Room not found')

        switch (doc.type) {
          case 'stream':

            await roomDb.update(doc._id, { $push: { members: socket.id } })

            socket.emit('joined', doc.type)
            socket.to(doc.owner).emit('joined', socket.id)
            break
          case 'conference':
            await roomDb.update(doc._id, { $push: { members: socket.id } })

            for (const to of doc.members) {
              socket.to(to).emit('joined', socket.id)
            }
            break
          default:
            throw Error('Incorrect room type')
            break
        }
      } catch (error) {
        socket.emit('join_failed')
        console.log(error)
      }
    })

    socket.on('make_offer', ({ to, offer }) => {
      socket.to(to).emit('offer_made', {
        from: socket.id,
        offer: offer
      })
    })

    socket.on('make_answer', ({ to, answer }) => {
      socket.to(to).emit('answer_made', {
        from: socket.id,
        answer: answer
      })
    })

    socket.on('request_offer', to => {
      socket.to(to).emit('offer_requested', socket.id)
    })

    socket.on('disconnect', async () => {
      try {
        const doc = await roomDb.findOne({ members: socket.id })

        if (doc) {
          if (doc.members.length > 1) {
            if (doc.type == 'conference') {
              for (const to of doc.members) {
                room.to(to).emit('left', socket.id)
              }

              await roomDb.update(doc._id, { $pull: { members: socket.id } })
            } else if (doc.type == 'stream') {
              if (socket.id == doc.owner) {
                for (const to of doc.members) {
                  room.to(to).emit('disconnected')
                }

                await roomDb.remove(doc._id)
              } else {
                room.to(doc.owner).emit('disconnected', socket.id)

                await roomDb.update(doc._id, { $pull: { members: socket.id } })
              }
            }
          } else {
            await roomDb.remove(doc._id)
          }
        }
      } catch (e) {
        console.log(error)
      }
    })
  })
}
