(async () => {
  // Importing Packages
  const http = require('http')

  // Setting Port
  let PORT = process.env.PORT || (process.env.ENV == 'production' ? 5000 : 8082)

  try {
    const app = http.createServer()

    require('./socket/media-stream')(app)

    app.listen(PORT, () => {
      console.log(`Server running at port ${PORT}.`)
    })
  } catch (error) {
    console.log(error)
  }
})()
