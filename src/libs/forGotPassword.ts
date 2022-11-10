import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";;

 export class recoveryAdminPass{
	 public async sendCode(code:any, email:string): Promise<any>{

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
                  html: `<div style="font-size:28px">Su codigo de verificacion: ${code}</div>`,
                })
                .then((res) => {
                 let dataEmail:any = res; 
                })
                .catch((err) => {
                  let dataEmailError:any = err; 
                });

	 }
}