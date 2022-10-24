<<<<<<< HEAD
import express,{Request, Response} from "express";
import path from "path"
import {PORT} from "../config/config"
import cors from "cors"
import RouterUser from "../router/router";
import fileUpload from "express-fileupload";
const AppServer: express.Application = express();
const startServer = () => {
    try {
        const urlConnectionAcceso:string = "http://localhost:3001"
        const statusCors:number = 200;
        const port: Number = 8080;
        AppServer.use(cors({
            origin: [urlConnectionAcceso, 'https://www.google.com/*'],
            methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
            optionsSuccessStatus:statusCors
        }));
        AppServer.use( express.static( path.join( __dirname, "public" ) ) );
        AppServer.use( express.json() );
        AppServer.use( express.urlencoded( { extended: true } ) )
    
        AppServer.listen( PORT || port, () => {
        
            console.log( "connection in the port: :", PORT );
        
        } )
        AppServer.use( fileUpload( {
            useTempFiles: true,
            createParentPath: true,
            safeFileNames: true,
            preserveExtension: true,
            tempFileDir: path.join( __dirname, "tmp" )
        } ) )
        AppServer.use(new RouterUser().routerLogin() );
    } catch ( error:any ) {
        
        throw new Error( error );
    }
    
}
startServer()
=======
import express, { application, json } from "express";
import path from "path";
import { PORT } from "../config/config";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "../routes/authUsers";

const AppServer: express.Application = express();
console.log("server is running");
const startServer = () => {
  try {
    const urlConnectionAcceso: string = "http://localhost:3001";
    const statusCors: number = 200;
    const port: Number = 8080;
    AppServer.use(
      cors({
        origin: [urlConnectionAcceso, "https://www.google.com/*"],
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
        optionsSuccessStatus: statusCors,
      })
    );
    AppServer.use(express.static(path.join(__dirname, "public")));
    AppServer.use(express.json());
    AppServer.use(express.urlencoded({ extended: true }));
    AppServer.use(morgan('dev'));
    AppServer.use(authRoutes);

    AppServer.listen(PORT || port, () => {
      console.log("connection in the port: :", PORT);
    });
  } catch (error: any) {
    throw new Error(error);
  }
};
startServer();
>>>>>>> c8e16b3197feb21c68c4a1e4149a73b5c19c6e34
