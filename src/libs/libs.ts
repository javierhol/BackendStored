import nodemailer from "nodemailer";
import {MAIL_PASSWORD, MAIL_USER} from "../config/config"
import dotenv from "dotenv";
import { PersonRegister } from "../interfaces/users";

export class sendMailAdmin {
  public async sendMailer(email: string): Promise<any> {
 const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                auth: {
                  user: 'stored754@gmail.com',
                  pass:'ocgsubbijuoiboiz',
                },
              });

              // send email
            return  await transporter
                .sendMail({
                  from: "stored754@gmail.com",
                  to: email,
                  subject: "Test Email Subject",
                  html: "esto es stored",
                })
                .then((res) => {
                 let dataEmail:any = res; 
                })
                .catch((err) => {
                  let dataEmailError:any = err; 
                });
  
  }
}


