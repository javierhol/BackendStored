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