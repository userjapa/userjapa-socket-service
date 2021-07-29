(async () => {
  // Importing Packages
  const http       = require('http'),
        express    = require('express'),
        bodyParser = require('body-parser'),
        cors       = require('cors')

  // Setting Port
  let PORT = process.env.PORT || (process.env.ENV == 'production' ? 5000 : 8082)

  try {
    // Create express app
    const app = express()

    // Setting app middlewares
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(cors({
      origin: '*',
      methods: ['GET'],
      allowedHeaders: ['Content-Type']
    }))

    // Setting app routes
    require('./routes')(app)

    // Create http server
    const server = http.createServer(app);

    // Set socket connection
    require('./socket/media-stream')(server)

    server.listen(PORT, () => {
      console.log(`Server running at port ${PORT}.`)
    })
  } catch (error) {
    console.log(error)
  }
})()
