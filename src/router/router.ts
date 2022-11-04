import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import LoginRegister from "../controllers/GestionUser";

const router: Router = Router();

class  RouterUser extends LoginRegister
{
    public Login() {
        
        router.post( "/login", this.LoginAuth);
        return router;
    }
    
     public registerAdmin(){
        router.post( "/register", this.RegisterUser);
        return router;       
     }
     public registerUser(){
        router.post( "/registerUser", this.userRegister);
        return router;       
     }
 
    }
    

export default RouterUser;



        

