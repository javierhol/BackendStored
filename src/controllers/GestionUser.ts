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
abstract class LoginRegister {
  public async RegisterUser(
    req: any,
    res: Response,
    next: Partial<NextFunction>
  ): Promise<Response | Request | any> {
    try {
      const data: PersonRegister = {
        correo: req.body?.correo,
        password: req.body.password,
        authCuenta: false,
        token: req.body.token,
        refreshToken: req.body.refreshToken,
        nameRol: "admin",
      };
      const expresiones = {
        password: /^.{4,20}$/,
        correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
      };

      if (
        expresiones.correo.test(data.correo) &&
        expresiones.password.test(data.password)
      ) {
        const roundNumber = 10;
        const encriptarPassword = await bcrypt.genSalt(roundNumber);
        const hasPassword = await bcrypt.hash(data.password, encriptarPassword);
        let state = ( data.authCuenta = true );
        let estado ="Activo"
        const conn = await conexion.connect();
        conn.query("SELECT * FROM admin", async (error, rows) => {
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].correo == data.correo)
              return res.json({ message: "ERR_EXIST_EMAIL", state: 302 });
          }
          await conn.query(
            `INSERT INTO admin (correo,password,authCuenta,estado) VALUES (?,?,?,?)`,
            [hasPassword, data.password, state,estado ],
            (error: Array<Error> | any, rows: any) => {
              console.log(error);
              console.log(rows);
              if (error) {
                return res.json({ message: "ERROR_DATA_ADMIN", error: error });
              }
              if (rows) {
                const token: any = jwt.sign(
                  { id: data.correo },
                  SECRET || "tokenGenerate",
                  { expiresIn: 60 * 60 * 24 }
                );
                const resultEmail = new sendMailAdmin().sendMailer(data.correo);
                console.log(resultEmail);

                return res.json({
                  message: "USER_CREATE_SUCCESFULL",
                  token,
                  auht: data.authCuenta,
                });
              }
            }
          );
        });
      } else {
        return res.json({
          message: "DATA_NOT_VALID",
        });
      }
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async LoginAuth(
    req: Partial<any>,
    res: Response,
    next: Partial<NextFunction>
  ): Promise<Response | Request | any> {
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

    // if (req.headers["authorization-google"]) {

    //   conn.query("")
    // }

    if (
      expresiones.correo.test(data.correo) &&
      expresiones.password.test(data.password)
    ) {
      conn.query(
        "SELECT password,idAdmin,rol FROM admin WHERE correo = ?",
        [data.correo],
        async (error: Array<Error> | any, rows: any) => {
          if (error)
            return res.json({ message: "ERROR_AUTH_ADMIN", error: error });
          if (rows) {
            const password = rows[0].password;
            console.log(rows);
            const passVerify: Boolean = await bcrypt.compare(
              req.body.password,
              password
            );
            if (passVerify) {
              const token: any = jwt.sign(
                { id: rows[0].idAdmin },
                SECRET || "tokenGenerate",
                { expiresIn: 60 * 60 * 24 }
              );
              return res.json({
                message: "ADMIN_AUTH_SUCCESFULL",
                token: token,
                auht: data.authCuenta,
                rol: rows[0].rol,
              });
            } else {
              return res.json({
                message: "ADMIN_AUTH_ERROR_DATA",
                token: null,
                auht: false,
              });
            }
          }
        }
      );
    } else {
      return res.json({
        message: "DATA_NOT_VALID",
      });
    }
  }
  public async userRegister(
    req: Request,
    res: Response,
    next: Partial<NextFunction>
  ): Promise<Response | Request | any> {
    try {
      let tokenIdAcc: any = req.headers["acc-token-data"];

      const verifyToken: Array<any> | any = jwt.verify(tokenIdAcc, SECRET)!;
      console.log(verifyToken);

      if (verifyToken?.id) {
        
      } else {
        return res.json({ messaje: "error token" });
      }

      const data: UserRegister = {
        tokenId: "",
        nombre: req.body.nombre,
        correo: req.body?.correo,
        password: req.body.password,
        nameRol: req.body.nameRol,
      };
      const expresiones = {
        password: /^.{4,20}$/,
        correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
      };

      if (
        expresiones.correo.test(data.correo) &&
        expresiones.password.test(data.password)
      ) {
        const roundNumber = 10;
        const encriptarPassword = await bcrypt.genSalt(roundNumber);
        const hasPassword = await bcrypt.hash(data.password, encriptarPassword);
        const conn = await conexion.connect();
        conn.query("SELECT * FROM usuario", async (error, rows) => {
          console.log(rows);

          for (let i = 0; i < rows.length; i++) {
            if (rows[i].correo == data.correo)
              return res.json({ message: "ERR_MAIL_EXIST_USER", status: 302 });
          }
          await conn.query(
            `INSERT INTO usuario (nombre,correo,password,nameRol,idAdminUser) VALUES (?,?,?,?,?)`,
            [
              data.nombre,
              data.correo,
              hasPassword,
              data.nameRol,
              verifyToken?.id,
            ],
            (error: Array<Error> | any, rows: any) => {
              console.log(error);
              console.log(rows);
              if (error)
                return res.json({ message: "ERROR_DATA_USER", error: error });
              if (rows) {
                const tokenId: any = jwt.sign(
                  { id: data.correo },
                  SECRET || "tokenGenerate",
                  { expiresIn: 60 * 60 * 24 }
                );

                return res.json({
                  message: "USER_CREATE_SUCCESFULLY",
                  tokenId,
                });
              }
            }
          );
        });
      } else {
        return res.json({
          message: "DATA_NOT_VALID",
          error: Error,
        });
      }
    } catch (error) {
      res.status(400).send({ tokenError: error, message: "necesita un token" });
    }
  }

  // public async loginUser(req: Request, res: Response,
  //   next:Partial<NextFunction>,
  // ):Promise<>{

  // }

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
        (error, rows) => {
          if (error) {
            return res.json({ message: error });
          }
          if (rows.length) {
            const min = 1000;
            const max = 9999;
            let idAuth = Math.floor(Math.random() * (max - min + 1) + min);

            conn.query(
              `UPDATE admin SET codigo = ? WHERE  correo = ?`,
              [idAuth, mail.correo],
              (error, rows) => {
                if (error)
                  return res.json({ message: "ERROR_CODE_WZ", err: error });

                conn.query(
                  "SELECT codigo FROM admin WHERE correo = ?",
                  [mail.correo],
                  (error, rows) => {
                    if (error)
                      return res.json({
                        message: "ERROR_CODE_OBTENER_CODE_SQL",
                      });

                    if (rows.length) {
                      const resultCode = new recoveryAdminPass().sendCode(
                        rows[0].codigo,
                        mail.correo
                      );
                      return res.json({ message: "VERIFY" });
                    } else {
                      if (error)
                        return res.json({
                          message: "ERROR_CODE_OBTENER_CODE_SQL",
                        });
                    }
                  }
                );
              }
            );
          } else {
            res.send("EMAIL_NOT_EXIT");
          }
        }
      );
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
  public async newPassAdmin(
    req: Request,
    res: Response,
    next: Partial<NextFunction>
  ): Promise<Response | Request | any> {
    try {
      const conn = await conexion.connect();
      const { codigo, correo, newPassword } = req.body;
      const validate: newPasswordAdmin = {
        correo: correo,
        codePass: codigo,
        newPassword: newPassword,
      };
      // actualizar contraseña
      conn.query(
        "SELECT * FROM admin WHERE correo = ?",
        [validate.correo],
        (error, rows) => {
          if (error)
            return res.json({ message: "ERROR_CODE_OBTENER_CODE_SQL", error });
          if (rows.length) {
            if (rows[0].codigo == validate.codePass) {
              const roundNumber = 10;
              const encriptarPassword = bcrypt.genSaltSync(roundNumber);
              const hasPassword = bcrypt.hashSync(
                validate.newPassword,
                encriptarPassword
              );
              conn.query(
                "UPDATE admin SET password = ? WHERE correo = ?",
                [hasPassword, validate.correo],
                (error, rows) => {
                  if (error)
                    return res.json({
                      message: "ERROR_CODE_OBTENER_CODE_SQL",
                      error,
                    });
                  if (rows) {
                    let codeRecovery = "";
                    conn.query("UPDATE admin SET codigo = ? WHERE correo =?", [
                      codeRecovery,
                      validate.correo,
                    ]);
                    return res.json({ message: "PASSWORD_CHANGE" });
                  }
                }
              );
            } else {
              return res.json({ message: "CODE_NOT_VALID" });
            }
          } else {
            return res.json({ message: "EMAIL_NOT_VALID" });
          }
        }
      );
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
  //login user

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
        expresiones.correo.test(data.correo) &&
        expresiones.password.test(data.password)
      )
        conn.query(
          "SELECT password,idUser FROM usuario WHERE correo = ?",
          [data.correo],
          async (error: Array<Error> | any, rows: any) => {
            if (error)
              return res.json({ message: "ERROR_AUUTH_USER", error: error });

            if (rows) {
              const password = rows[0].password;
              const compararPassword: Boolean = await bcrypt.compareSync(
                data.password,
                password
              );
              if (compararPassword) {
                const token: any = jwt.sign(
                  {
                    id: rows[0].idUser,
                  },
                  SECRET || "tokenGenerate",
                  { expiresIn: 60 * 60 * 24 }
                );
                return res.json({
                  message: "USER_AUTH_SUCCESFULL",
                  token: token,
                  auth: authUser
                });
              } else {
                return res.json({
                  message: "USER_AUTH_ERROR_DATA",
                  token: null,
                  auth: false,
                });
              }
            }
          }
        );
    } catch (error) {
      return error;
    }
  }
}

export default LoginRegister;
