import nodemailer from 'nodemailer';
import dotenv from 'dotenv';import { PersonRegister } from '../interfaces/users';
dotenv.config();
import LoginRegister from '../controllers/GestionUser';


export const transporter = nodemailer.createTransport({
    host: "smtp.email.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER, 
      pass: process.env.MAIL_PASSWORD, 
    },
  });

  transporter.sendMail({
      from: '"Fred Foo 👻" <javierholguin596@gmail.com>', 
      to:"mernstack35@gmail.com",
      subject: "Hello ✔", 
      text: "Hello world?", 
      html: "<b>Hello world?</b>",
    });

    
  transporter.verify().then(() => {
    console.log("Ready for send emails");
  });
