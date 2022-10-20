import express from "express";
import path from "path";
import {PORT} from "../config/config"
const AppServer: express.Application = express();


const startServer = () => {

    AppServer.use(express.static(path.join(__dirname, "views")))


}