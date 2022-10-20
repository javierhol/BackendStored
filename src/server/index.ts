import express from "express";
import path from "path"
import {PORT} from "../config/config"
const AppServer: express.Application = express();

console.log("Hola");


const startServer = () => {
    try {
        const port: Number = 8080;
        AppServer.use( express.static( path.join( __dirname, "public" ) ) );
        AppServer.use( express.json() );
        AppServer.use( express.urlencoded( { extended: true } ) )
    
        AppServer.listen( PORT || port, () => {
        
            console.log( "Estas conectado en el puerto:", PORT );
        
        } )
    } catch ( error:any ) {
        
       throw new Error( error);
        
    }
}
startServer()