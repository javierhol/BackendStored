import bcrypt from "bcrypt";
import { Request, Response, NextFunction, response } from "express";
import {
  login,
  PersonRegister,
  UserRegister,
  forgotPassword,
  newPasswordAdmin,
} from "../interfaces/users";
import { conexion } from "../database/database";
import jwt from "jsonwebtoken";
import { SECRET } from "../config/config"; // <--- this is the problem
import { sendMailAdmin } from "../libs/libs";
import { recoveryAdminPass } from "../libs/forGotPassword";
import { authUser } from "../auth/authUser";
import { recoveryUserPass } from "../libs/forgotPassUser";
// import { newPasswordUser } from "../interfaces/users";
abstract class LoginRegister {

  public async veryfidCode(req: Request,
    res: Response,
    next: Partial<NextFunction>):Promise<Response | Request | any> {
  
    
    console.log(req.body);
    
    const conn = await conexion.connect();
    conn.query( "SELECT codigo FROM admin Where correo =?",[req.body.data.email], async ( error, rows ) => {
      for ( let i = 0; i < rows.length; i++ ) {
        console.log(rows);
        
        if ( rows[i].codigo == parseInt(req.body.data.codigo) ) {
          return res.status(200).json( { message: "CODE_CORRECT", code:rows[i].codigo} );
        } else {
          return res.status(400).json( { message: "CODE_INCORRECT" } );
        }
      }
      
    })

}
  public async RegisterUser(
    req: any,
    res: Response,
    next: Partial<NextFunction>
  ): Promise<Response | Request | any> {
    try {
      const data: PersonRegister = {
        correo: req.body.postDataAdmin.correo,
        password: req.body.postDataAdmin.password,
        authCuenta: false,
        token: req.body.token,
        refreshToken: req.body.refreshToken,
        nameRol: "admin"
        
      };
      const expresiones = {
        password: /^.{4,20}$/,
        correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
      };

      if (
        expresiones.correo.test( data.correo ) &&
        expresiones.password.test( data.password )
      ) {
        const roundNumber = 10;
        const encriptarPassword = await bcrypt.genSalt( roundNumber );
        const hasPassword = await bcrypt.hash( data.password, encriptarPassword );
        let state = ( data.authCuenta = true );
        let estado = "Activo"
        const conn = await conexion.connect();
        conn.query( "SELECT * FROM admin", async ( error, rows ) => {
          for ( let i = 0; i < rows.length; i++ ) {
            if ( rows[i].correo == data.correo )
              return res.status(400).json( { message: "ERR_EXIST_EMAIL" } );
          }
          await conn.query(
            `INSERT INTO admin (correo,password,authCuenta,estado) VALUES (?,?,?,?)`,
            [data.correo, hasPassword, state, estado],
            ( error: Array<Error> | any, rows: any ) => {
              console.log( error );
              console.log( rows );
              if ( error ) {
                return res.json( { message: "ERROR_DATA_ADMIN", error: error } );
              }
              if ( rows ) {
                const token: any = jwt.sign(
                  { id: data.correo },
                  SECRET || "tokenGenerate",
                  { expiresIn: 60 * 60 * 24 }
                );
                const resultEmail = new sendMailAdmin().sendMailer( data.correo );

                return res.json( {
                  message: "USER_CREATE_SUCCESFULL",
                  token,
                  auht: data.authCuenta,
                } );
              }
            }
          );
        } );
      } else {
        return res.json( {
          message: "DATA_NOT_VALID",
        } );
      }
    } catch ( error: any ) {
      throw new Error( error );
    }
  }

  public async LoginAuth(
    req: Partial<any>,
    res: Response,
    next: Partial<NextFunction>
  ): Promise<Response | Request | any> {

    try {

      const data: login = {
        correo: req.body.postDataUser.email,
        password: req.body.postDataUser.password,
        authCuenta: true,
        token: req.body.token,
        refreshToken: req.body.refreshToken,
      };

      const conn = await conexion.connect();

      // if (req.headers["authorization-google"]) {

      //   conn.query("")
      // }
      conn.query(
        "SELECT password,idAdmin,rol FROM admin WHERE correo = ?",
        [data.correo],
        async ( error: Array<Error> | any, rows: any ) => {
          if ( error )
            return res.status(400).json( { message: "ERROR_DB", error: error } );
          if ( rows.length > 0 ) {
            const password = rows[0].password;
            
            const passVerify: Boolean = await bcrypt.compare(
              data.password,
              password
            );
            console.log( passVerify );

            if ( passVerify ) {

              const token: any = jwt.sign(
                { id: rows[0].idAdmin },
                SECRET || "tokenGenerate",
                { expiresIn: 60 * 60 * 24 }
              );
              return res.status( 200 ).json( {
                message: "ADMIN_AUTH_SUCCESFULL",
                token: token,
                auth: data.authCuenta,
                rol: rows[0].rol,
              } );
            } else {
              console.log("hola");
              
              return res.status( 401 ).json( {
                message: "ADMIN_AUTH_ERROR_DATA",
                token: null,
                auht: false,
              } );
            }
          } else {

            return res.status( 400 ).json( { message: "NOT_EXIST_USER", token: null, auht: false, } );
          }
        }
      );
    } catch ( error ) {

      return res.status(500).json( { message: "ERROR_AUTH_ADMIN", error: error } )

    }
  }
  public async userRegister(
    req: Request,
    res: Response,
    next: Partial<NextFunction>
  ): Promise<Response | Request | any> {
    try {
      let tokenIdAcc: any = req.headers["acc-token-data"];

      const verifyToken: Array<any> | any = jwt.verify( tokenIdAcc, SECRET )!;
      console.log( verifyToken );

      if ( verifyToken?.id ) {

      } else {
        return res.json( { messaje: "error token" } );
      }
    } catch (error) {
      res.status(400).send({ tokenError: error, message: "NOT_VERIFY_TOKEN" });
    }
  }

  public async loginUser(
    req: Partial<any>,
    res: Response,
    next: Partial<NextFunction>
  ): Promise<Response | Request | any> {
    try {
      const data: login = {
        correo: req.body.correo,
        password: req.body.password,
        authCuenta: true,
        token: req.body.token,
        refreshToken: req.body.refreshToken,
      };

      const conn = await conexion.connect();
      const expresiones = {
        password: /^.{4,20}$/,
        correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
      };
      if (
        expresiones.correo.test( data.correo ) &&
        expresiones.password.test( data.password )
      ) {
        const roundNumber = 10;
        const encriptarPassword = await bcrypt.genSalt( roundNumber );
        const hasPassword = await bcrypt.hash( data.password, encriptarPassword );
        const conn = await conexion.connect();
        conn.query( "SELECT * FROM usuario", async ( error, rows ) => {
          for ( let i = 0; i < rows.length; i++ ) {
            if ( rows[i].correo == data.correo )
              return res.json( { message: "ERR_MAIL_EXIST_USER", status: 302 } );
          }
          await conn.query(
            `INSERT INTO usuario (nombre,correo,password,nameRol,idAdminUser) VALUES (?,?,?,?,?)`,
            [
              // data.nombre,
              // data.correo,
              // hasPassword,
              // data.nameRol,
              // verifyToken?.id,
            ],
            ( error: Array<Error> | any, rows: any ) => {
              console.log( error );
              console.log( rows );
              if ( error )
                return res.json( { message: "ERROR_DATA_USER", error: error } );
              if ( rows ) {
                const tokenId: any = jwt.sign(
                  { id: data.correo },
                  SECRET || "tokenGenerate",
                  { expiresIn: 60 * 60 * 24 }
                );

                return res.json( {
                  message: "USER_CREATE_SUCCESFULLY",
                  tokenId,
                } );
              }
            }
          );
        } );
      } else {
        return res.json( {
          message: "DATA_NOT_VALID",
          error: Error,
        } );
      }
    } catch ( error ) {
      res.status( 400 ).send( { tokenError: error, message: "necesita un token" } );
    }
  }

  public async newPassUser(
    req: any,
    res: any,
    next: Partial<NextFunction>
  ): Promise<Response | Request | any> {
    try {
      const conn = await conexion.connect();
      const { codigo, correo, newPassword } = req.body;
       const validate:any  = {
        correo: correo,
        codePass: codigo,
        newPassword: newPassword,
      };
      const expresiones = {
        password: /^.{4,20}$/,
      };
      if (expresiones.password.test(validate.newPassword)) {
        conn.query(
          "SELECT * FROM usuario WHERE correo = ? AND codigo = ?",
          [validate.correo, validate.codePass],
          async (error, rows) => {
            if (error) {
              return res.json({ message: "ERROR_NEW_PASS", error: error });
            }
            if (rows.length) {
              const password = await bcrypt.hashSync(validate.newPassword, 10);
              conn.query(
                "UPDATE usuario SET password = ? WHERE correo = ?",
                [password, validate.correo],
                (error, rows) => {
                  if (error)
                    return res.json({
                      message: "ERROR_UPDATE_PASS",
                      error: error,
                    });
                  if (rows) {
                    return res.json({ message: "PASS_UPDATE_SUCCESFULLY" });
                  }
                }
              );
            } else {
              return res.json({ message: "ERROR_NEW_PASS" });
            }
          }
        );
      } else {
        return res.json({ message: "EMAIL_NOT_VALID" });
      }
    } catch (error) {
      return res.status(400).json({ error });
    }
  }

  public async recoveryPassword(
    req: Request,
    res: Response,
    next: Partial<NextFunction>
  ): Promise<Response | Request | any> {
    try {
      const conn = await conexion.connect();
      const { email } = req.body;
      const mail: forgotPassword = {
        correo: email,
      };
      conn.query(
        "SELECT * FROM admin WHERE correo=?",
        [mail.correo],
        ( error, rows ) => {
          if ( error ) {
            return res.json( { message: error } );
          }
          if ( rows.length ) {
           const min = 100000;
            const max = 999999;
            let idAuth = Math.floor( Math.random() * ( max - min + 1 ) + min );

            conn.query(
              `UPDATE admin SET codigo = ? WHERE  correo = ?`,
              [idAuth, mail.correo],
              ( error, rows ) => {
                if ( error )
                  return res.json( { message: "ERROR_CODE_WZ", err: error } );

                conn.query(
                  "SELECT codigo FROM admin WHERE correo = ?",
                  [mail.correo],
                  ( error, rows ) => {
                    if ( error )
                      return res.json( {
                        message: "ERROR_CODE_OBTENER_CODE_SQL",
                      } );

                    if ( rows.length ) {
                      const resultCode = new recoveryAdminPass().sendCode(
                        rows[0].codigo,
                        mail.correo
                      );
                      return res.status(200).json( { message: "VERIFY",email:mail.correo} );
                    } else {
                      if ( error )
                        return res.json( {
                          message: "ERROR_CODE_OBTENER_CODE_SQL",
                        } );
                    }
                  }
                );
              }
            );
          } else {
            res.status( 401 ).json( { message: "EMAIL_NOT_EXIST" } );
          }
        }
      );
    } catch ( error ) {
      return res.status( 400 ).json( { error } );
    }
  }
  public async newPassAdmin(
    req: Request,
    res: Response,
    next: Partial<NextFunction>
  ): Promise<Response | Request | any> {
    try {
      const conn = await conexion.connect();
      const { codigo, correo, newPassword } = req.body.data;
     
      const validate: newPasswordAdmin = {
        correo: correo,
        codePass: codigo,
        newPassword: newPassword,
      };
      // actualizar contraseña
      conn.query(
        "SELECT * FROM admin WHERE correo = ?",
        [validate.correo],
        ( error, rows ) => {
          if ( error )
            return res.json( { message: "ERROR_CODE_OBTENER_CODE_SQL", error } );
          if ( rows.length ) {
            if ( rows[0].codigo == validate.codePass ) {
              const roundNumber = 10;
              const encriptarPassword = bcrypt.genSaltSync( roundNumber );
              const hasPassword = bcrypt.hashSync(
                validate.newPassword,
                encriptarPassword
              );
              conn.query(
                "UPDATE admin SET password = ? WHERE correo = ?",
                [hasPassword, validate.correo],
                ( error, rows ) => {
                  if ( error )
                    return res.json( {
                      message: "ERROR_CODE_OBTENER_CODE_SQL",
                      error,
                    } );
                  if ( rows ) {
                    let codeRecovery = "";
                    conn.query( "UPDATE admin SET codigo = ? WHERE correo =?", [
                      codeRecovery,
                      validate.correo,
                    ] );
                    return res.status(204).json( { message: "PASSWORD_CHANGE" } );
                  }
                }
              );
            } else {
              return res.status(401).json( { message: "CODE_NOT_VALID" } );
            }
          } else {
            return res.status(400).json( { message: "EMAIL_NOT_VALID" } );
          }
        }
      );
    } catch ( error ) {
      return res.status( 400 ).json( { error } );
    }
  }
}

export default LoginRegister;
