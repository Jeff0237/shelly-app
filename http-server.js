const EventEmitter = require('eventemitter3')
const express = require('express')

const packageJson = require('./package.json')

class HttpServer extends EventEmitter {
  constructor(device, port = 8080) {
    super()

    this.device = device
    this.server = null
    this.app = express()
    this.port = port
  }

  start() {
    if (this.server !== null) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      this.app.use((req, res, next) => {
        console.log(req.method, req.url)
        next()
      })

      this.device.setupHttpRoutes(this.app)

      this.server = this.app.listen(this.port, error => {
        if (!error) {
          resolve()
        } else {
          reject(error)
        }
      })
    })
  }

  stop() {
    if (this.server === null) {
      return Promise.resolve()
    }

    return new Promise(resolve => {
      this.server.close(() => {
        this.server = null
        resolve()
      })
    })
  }
}

module.exports = HttpServer
