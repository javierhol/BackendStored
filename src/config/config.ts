import dotenv from "dotenv";

dotenv.config()

export const PORT = process.env["PORT"]

export const SECRET:any = process.env["SECRET"];