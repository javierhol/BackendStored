import bycrpt from 'bcrypt';
import { Request, Response, NextFunction, response } from 'express';
import { login, PersonRegister } from "../interfaces/users"

import jwt from "jsonwebtoken"
import { SECRET } from "../config/config";  // <--- this is the problem

abstract class LoginRegister{

    public async RegisterUser(req : Partial< Request>, res : Response, next : Partial<NextFunction> ) : Promise<Response | Request | any>{
        try {
            
        } catch (error:any) {
             throw new Error(error)

        }
    }

    public async LoginAuth( req: Partial< Request>, res:Response, next: Partial<NextFunction> ): Promise<Response | Request | any>  {
    
        const data: login = {
            email: req.body.email,
            password: req.body.password,
            auth: true,
            token: req.body.token,
            refreshToken: req.body.refreshToken,
            nameRol: ["admin", "user", "superadmin"],
        }
        const token = jwt.sign( { /*id: rows[0].idAdmin*/ }, SECRET, { expiresIn: 60 * 60 * 24 },
        ( err, token ) => {
            
        }
        )

        
    }

}
 

export default LoginRegister;