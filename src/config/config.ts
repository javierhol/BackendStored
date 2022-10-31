import dotenv from "dotenv";

dotenv.config()

export const PORT = process.env["PORT"]

export const SECRET: any = process.env["SECRET"];
// ? DATABASE
export const HOST = process.env["HOST"];
export const DBNAME = process.env["DATABASE"]
export const PASSWORD = process.env["PASSWORD"]
export const USER = process.env["USER"]
export const PORTDB = process.env["PORTDB"]
export const LIMIT_CONNECION = process.env["CONNECTION_LIMIT"]