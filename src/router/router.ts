import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import LoginRegister from "../controllers/GestionUser";

const router: Router = Router();

abstract class  RouterUser extends LoginRegister
{
    public routerLogin() {
        
        router.get( "/login", this.LoginAuth);
        return router;
    }
    
     public register (){
        router.post( "/register", this.RegisterUser);
        
     }

     
        
    }
    

export default RouterUser;



        
