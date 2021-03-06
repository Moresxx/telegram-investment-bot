// Modules
import bodyParser from 'body-parser'
import express, { Express, Router } from 'express'
import session from 'express-session'
import Logger from '../init/logger.js'
import IConfig from '../interfaces/IConfig'
import router from './router/router'

const cors = require('cors')
const config: IConfig = require('../../config/config.json')
const MongoStore = require('connect-mongo')(session)

export default class Server {
  public static host: string = process.env.NODE_ENV === 'production' ? config.prod.api.host : config.dev.api.host
  public static port: number = process.env.NODE_ENV === 'production' ? config.prod.api.port : config.dev.api.port
  
  public static app: Express = express()
  public static router: Router = router
  
  public static init() {
    let sessionConfig = process.env.NODE_ENV === 'production' ? config.prod.api.session : config.dev.api.session
    sessionConfig = Object.assign(sessionConfig, {
      store: new MongoStore({
        url: process.env.NODE_ENV === 'production' ? config.prod.dbUrl : config.dev.dbUrl
      })
    })
    const corsOptions = process.env.NODE_ENV === 'production' ? config.prod.cors : config.dev.cors
    
    this.app.use(cors(corsOptions)) // CORS
    this.app.use(bodyParser.json()) // Body parser
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(session(sessionConfig)) // Sessions
    
    // Routing
    this.app.use('/', this.router)
    
    // Listen for requests
    this.app.listen(this.port, this.host, () => {
      Logger.trace(`>>> АПИ сервер слушает на http://${this.host}:${this.port}`)
    })
  }
}
