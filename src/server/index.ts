import express,{Request, Response} from "express";
import path from "path"
import {PORT} from "../config/config"
const AppServer: express.Application = express();
import cors from "cors"
console.log("Hola");

const startServer = () => {
    try {
        AppServer.use((req:Request, res:Response, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-COntrol-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
}) 
        const DIRECTORIO_PERMITIDO_CORS = "http://localhost:4200";
        AppServer.use( cors( {
            origin: DIRECTORIO_PERMITIDO_CORS,
            optionsSuccessStatus: 200
        }))
        const port: Number = 8080;
        AppServer.use( express.static( path.join( __dirname, "public" ) ) );
        AppServer.use( express.json() );
        AppServer.use( express.urlencoded( { extended: true } ) )
    
        AppServer.listen( PORT || port, () => {
            console.log( "Estas conectado en el puerto:", PORT );
        } )
    } catch ( error:any ) {
        
        throw new Error( error );
    }
    
}
startServer()