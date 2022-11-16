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
                  html: `
                  <div style="display:flex;width:320px;margin:10px auto;border:1px solid #ccc;border-radius:6px;padding:0px; flex-direction:column">
				  <span style="font-family: Arial, Helvetica, sans-serif;
				  border-bottom: 1px solid #009AFA;
				  padding: 6px; text-align: center;">Su correo: ${email}</span>
                  <span style="font-weight: 500; font-size:20px; font-family:Arial, Helvetica, sans-serif;text-align:start;
				   padding: 5px;">Continue con la recuperacion de su contraseña en stored</span>
                  <p style="font-family:Arial, Helvetica, sans-serif;
				  text-align: center; ">Su codigo para el cambio de contraseña 🔏</p>
                   <p style="background: #AED6F1 ; color: rgb(20, 28, 39);
				   padding: 8px; font-size: 25px;
				    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
					text-align: center; border-radius: 4px; display: inline-block; width:50%;  margin:4px auto; ">${code}<p/>
					<span style="font-family:Arial, Helvetica, sans-ser; padding: 8px; color: #009AFA;
					 text-align:start; display: inline-block;">Una vez completado, puedes comenzar a utilizar todas las funcionalidades
						de stored 📚📲
					</span>
                  </div>

                 `,
                })
                .then((res) => {
                 let dataEmail:any = res; 
                })
                .catch((err) => {
                  let dataEmailError:any = err; 
                });

	 }
}