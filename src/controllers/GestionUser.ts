import bycrpt from 'bcrypt';
import { Request, Response, NextFunction, response } from 'express';
import { login, PersonRegister } from "../interfaces/users"
import { connect } from '../database/database';
import jwt from "jsonwebtoken"
import { SECRET } from '../config/config';  // <--- this is the problem

abstract class LoginRegister{

    public async RegisterUser(req :any, res : Response, next : Partial<NextFunction> ) : Promise<Response | Request | any>{

        try {
            const data : PersonRegister = {
            
                correo: req.body?.correo!,
                password: req.body.password,
                authCuenta: false,
                token: req.body.token,
                refreshToken: req.body.refreshToken,
                nameRol: ["admin", "user", "superadmin"]
            }
            const expresiones = {
                usuario: /^[a-zA-Z0-9\_\-]{4,16}$/, // Letras, numeros, guion y guion_bajo
                nombre: /^[a-zA-ZÀ-ÿ\s]{1,40}$/, // Letras y espacios, pueden llevar acentos.
                password: /^.{4,20}$/, // 4 a 12 digitos.
                correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                telefono: /^\d{7,14}$/ // 7 a 14 numeros.
            }
            if ( expresiones.correo.test( data.correo ) && expresiones.password.test( data.password ) ) {
                let state = data.authCuenta = true;
                const conn = await connect();
                const response:any =await conn.query( `INSERT INTO admin (correo,password,authCuenta) VALUES (?,?,?)`,
                    [data.correo, data.password, state]);
                return res.status( 200 ).json( {
                    message: "Usuario registrado correctamente",
                } );
            } else {
                return res.status( 400 ).json( {
                    message: "Datos incorrectos"
                } );
            }
        } catch (error:any) {
            throw new Error(error);

        }
       
       
        // const token = jwt.sign( {}, SECRET, { expiresIn: 60 * 60 * 24 },
        // ( err, token ) => {
            
        // }
        // )
    
    }

    public async LoginAuth( req: Partial< any>, res:Response, next: Partial<NextFunction> ): Promise<Response | Request | any>  {
    
        const data: login = {
            correo: req.body.correo,
            password: req.body.password,
            authCuenta: true,
            token: req.body.token,
            refreshToken: req.body.refreshToken,
            nameRol: ["admin", "user", "superadmin"],
        }
        const token = jwt.sign( { /*id: rows[0].idAdmin*/ }, SECRET, { expiresIn: 60 * 60 * 24 },
        ( err: any, token: any ) => {
            
        }
        )

        
    }

}
 

export default LoginRegister;