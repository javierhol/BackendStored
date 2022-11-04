import nodemailer from 'nodemailer';
import PersonRegister from '../controllers/GestionUser'
import {Response,Request}from 'express'



const ForgotPassword ={

    async sendMail(req: Request, res: Response):Promise<any>{

        if(req.body.email == ""){
            res.status(400).send({error: "Email is required"})
        }

    }

}