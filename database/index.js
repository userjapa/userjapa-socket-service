const fs   = require('fs'),
      path = require('path')

const Datastore = require('nedb')

class Database {
  constructor(name) {
    const filePath = path.join(__dirname, `/${name}.db`)

    if (!fs.existsSync(filePath)) {
      fs.open(filePath, 'w', err => {
        if (err)
          throw err
      })
    }

    this.database = new Datastore({ filename: filePath, autoload: true });
  }

  insert (data) {
    return new Promise((resolve, reject) => {
      this.database.insert(data, (err, doc) => {
        if (err)
          return reject(err)

        resolve(doc)
      })
    })
  }

  find (filter) {
    return new Promise((resolve, reject) => {
      this.database.find(filter, (err, docs) => {
        if (err)
          return reject(err)

        resolve(docs)
      })
    })
  }

  findOne (filter) {
    return new Promise((resolve, reject) => {
      this.database.findOne(filter, (err, doc) => {
        if (err)
          return reject(err)

        resolve(doc)
      })
    })
  }

  update (_id, data) {
    return new Promise((resolve, reject) => {
      this.database.update(data, { _id }, {}, (err, numReplaced) => {
        if (err)
          return reject(err)

        resolve(numReplaced)
      })
    })
  }

  remove (_id) {
    return new Promise((resolve, reject) => {
      this.database.remove({ _id }, {}, (err, numRemoved) => {
        if (err)
          return reject(err)

        resolve(numRemoved)
      })
    })
  }
}

module.exports = Database
