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
        correo: req.body.postDataAdmin.email,
        password: req.body.postDataAdmin.password,
        authCuenta: false,
        token: req.body.token,
        refreshToken: req.body.refreshToken,
        nameRol: "admin"
        
      };
      
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
            `INSERT INTO admin (correo,password,authCuenta,estado ,rol) VALUES (?,?,?,?,?)`,
            [data.correo, hasPassword, state, estado,data.nameRol],
            ( error: Array<Error> | any, rows: any ) => {
              if ( error ) {
                return res.status(401).json( { message: "ERROR_DATA_ADMIN", error: error } );
              }
              if ( rows ) {
                console.log( rows );
                
                const token: any = jwt.sign(
                  { id: data.correo },
                  SECRET || "tokenGenerate",
                  { expiresIn: 60 * 60 * 24 }
                );
                //const resultEmail = new sendMailAdmin().sendMailer( data.correo );
                  console.log("data creada");
                  
                return res.status(200).json( {
                  message: "USER_CREATE_SUCCESFULL",
                  token,
                  auht: data.authCuenta,
                } );
              }else{
                return res.status(400).json( { message: "ERROR_DATA_ADMIN" } );
              }
            }
          );
        } );
    } catch ( error: any ) {
    return res.status(500).json({message:"ERROR_SERVER"})
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
      console.log("not exist", req.body)

      const conn = await conexion.connect();
      
      conn.query(
        "SELECT password,idAdmin,rol FROM admin WHERE correo = ?",
        [data.correo],
        async ( error: Array<Error> | any, rows: any ) => {
          if ( error )
            
            return res.status( 400 ).json( { message: "ERROR_DB", error: error } );

          if ( rows.length >0) {
            const password = rows[0].password;
            
            const passVerify: Boolean = await bcrypt.compare(
              data.password,
              password
            );

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
            
              
              return res.status( 401 ).json( {
                message: "ADMIN_AUTH_ERROR_DATA",
                token: null,
                auht: false,
              } );
            }
          } else {
            /* users */
            conn.query( "SELECT password,idUser,rol FROM usuario WHERE correo = ?",
              [data.correo], async ( error: Array<Error> | any, rows: any ) => { 
                if ( error ) return res.status( 400 ).json( { message: "ERROR_DB", error: error } );
                if ( rows.length > 0 ) {
                const password = rows[0].password;
            
                  const passVerify: Boolean = await bcrypt.compare(
                    data.password,
                    password
                  );
                  if ( passVerify) {

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
            
              
                    return res.status( 401 ).json( {
                      message: "ADMIN_AUTH_ERROR_DATA",
                      token: null,
                      auht: false,
                    } );
                  }
                } else {
                  
                  return res.status( 400 ).json( { message: "NOT_EXIST_USER_ARE", token: null, auht: false, } );
                }
              } )


          }
        }
      );
    } catch ( error ) {

      return res.status(500).json( { message: "ERROR_AUTH_ADMIN", error: error } )

    }
  }

  public async passpAuthGoogle( req: Request,
    res: Response,
    next: Partial<NextFunction> ): Promise<Response | Request | any>{
    try {
      const conn = await conexion.connect();
      const {email, name, picture} = req.body.data;
      console.log( email, name, picture );
      conn.query( "SELECT * FROM admin  Where correo = ?",
        [email], async ( error: Array<Error> | any, rows: any ) => {

          if ( error ) return res.status( 400 ).json( { message: "ERROR_DB", error: error } );
         console.log(rows);
         let rol ="admin"
          if ( rows.length > 0 ) {
                 console.log("exist");
                 
                 conn.query("SELECT idAdmin,rol FROM admin WHERE correo = ?",
                         [email], async ( error: Array<Error> | any, rows: any ) => {
                            if ( error ) return res.status( 400 ).json( { message: "ERROR_DB", error: error } );
                           if ( rows.length > 0 ) {
                              const token: any = jwt.sign(
                                    { id: rows[0].idAdmin },
                                    SECRET || "tokenGenerate",
                                    { expiresIn: 60 * 60 * 24 }
                             );
                             return res.status( 200 ).json( {
                               message: "ADMIN_AUTH_SUCCESFULL_GOOGLE",
                               token: token,
                               auth: true,
                               rol: rows[0].rol,
                                
                             });
                             
                           } else {
                             return res.status( 400 ).json( { message: "ERROR_DATA_GOOGLE" } );
                           }
                         })
          } else {
            conn.query( "INSERT INTO admin (correo, nombre, imgUrl,rol) VALUES (?,?,?,?)",
                   [email, name, picture,rol], async ( error: Array<Error> | any, rows: any ) => {
                     if ( rows ) {
                        
                       conn.query("SELECT idAdmin,rol FROM admin WHERE correo = ?",
                         [email], async ( error: Array<Error> | any, rows: any ) => {
                            if ( error ) return res.status( 400 ).json( { message: "ERROR_DB", error: error } );
                           if ( rows.length > 0 ) {
                              const token: any = jwt.sign(
                                    { id: rows[0].idAdmin },
                                    SECRET || "tokenGenerate",
                                    { expiresIn: 60 * 60 * 24 }
                             );
                             return res.status( 200 ).json( {
                               message: "ADMIN_AUTH_SUCCESFULL_GOOGLE",
                               token: token,
                               auth: true,
                               rol: rows[0].rol,
                                
                             });
                             
                           } 
                         })
                      }

                 })
         }
      })       
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
      let tokenIdAcc: any = req.headers["acc-token-data"];
      const verifyToken: Array<any> | any = jwt.verify( tokenIdAcc, SECRET )!;
      const data: login = {
        correo: req.body.postDataUserRegister.email ,
        password: req.body.postDataUserRegister.password,
        authCuenta: true,
        token: req.body.token,
        refreshToken: req.body.refreshToken,
      };
      
      console.log(req.body);
      
      if ( verifyToken?.id ) {
        console.log(verifyToken?.id);
        
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
            `INSERT INTO usuario (correo,password ,rol, estado, idAdminUser) VALUES (?,?,?,?,?)`,
            [
              
              data.correo,
               hasPassword, 
               req.body.postDataUserRegister.rol,
               req.body.postDataUserRegister.estado,           
               verifyToken?.id,
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
      }else{
        return res.status(401).json({message:"N0T_ALLOWED"})
      }
       
      
    } catch ( error ) {
      res.status( 400 ).send( { message: "NOT_AUTORIZED" } );
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
      console.log(req.body);
      
      
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
