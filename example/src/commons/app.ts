import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as helmet from 'helmet';
import * as hpp from 'hpp';
import { checkBearerToken } from './authorization.middleware';

export class App {
  public app    : express.Application;
  public router : express.Router;
  public port   : (string | number);
  public isProd : boolean;
  
  constructor() {
    this.app      = express();
    this.port     = process.env.PORT || 3000;
    this.router   = express.Router();
    this.isProd   = (process.env.NODE_ENV === 'production');

    this.initializeMiddlewares();
  }

  public listen() {
    this.app.listen(this.port, () => console.info(`🚀 App listening on the port ${this.port}`));
  }

  protected initializeMiddlewares() {

    if (this.isProd) {

      const { ORIGINS_ALLOWED } = process.env;
      this.app.use(hpp());
      this.app.use(helmet());
      
      if (ORIGINS_ALLOWED) 
        this.app.use(cors({ origin: ORIGINS_ALLOWED.split(',').map(o => o.trim()), credentials: true }));
    } else {
      this.app.use(cors({ origin: true, credentials: true }));
    }

    this.app.use(express.json({limit: "5mb"}));
    this.app.use(express.urlencoded({ extended: true , limit: "5mb"}));
    this.app.use(cookieParser());

    this.app.use('/uploads', checkBearerToken, express.static('uploads'));
  }
}

