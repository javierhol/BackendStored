import bcrypt from "bcrypt";
import { Request, Response, NextFunction, response } from "express";
import { login, PersonRegister, UserRegister } from "../interfaces/users";
import { conexion } from "../database/database";
import jwt from "jsonwebtoken";
import { SECRET } from "../config/config"; // <--- this is the problem
import { transporter } from "../config/mailer";
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
        let state = (data.authCuenta = true);
        const conn = await conexion.connect();
        await conn.query(
          `INSERT INTO admin (correo,password,rol,authCuenta) VALUES (?,?,?,?)`,
          [data.correo, hasPassword, data.nameRol, state],
          (error: Array<Error> | any, rows: any) => {
            console.log(error);
            console.log(rows);
            if (error)
              return res.json({ message: "ERROR_DATA_ADMIN", error: error });

            if (rows) {
              const token: any = jwt.sign(
                { id: data.correo },
                SECRET || "tokenGenerate",
                { expiresIn: 60 * 60 * 24 }
              );

              return res.json({
                message: "USER_CREATE_SUCCESFULL",
                token,
                auht: data.authCuenta,
              });
            }
          }
        );
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
                message: "USER_AUTH_SUCCESFULL",
                token: token,
                auht: data.authCuenta,
                rol: rows[0].rol,
              });
            } else {
              return res.json({
                message: "USER_AUTH_ERROR_DATA",
                token: null,
                auht: false,
              })
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
 public async userRegister  (

    req: Request, res: Response, next:Partial<NextFunction>

 ): Promise<Response | Request | any> {

  try {
    const data:UserRegister={
      tokenId: req.body.tokenId,
      nombre: req.body.nombre,
      correo: req.body?.correo,
      password: req.body.password,
      nameRol: req.body.nameRole
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
    }
  } catch (error) {
    res.status(400).send({ message: error})
  }
  
 }
}

export default LoginRegister;
