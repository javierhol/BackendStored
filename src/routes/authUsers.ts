import { Router } from "express";
import {Response,Request} from "express";

const router: Router =  Router();


router.get("/", (req:Request, res:Response) => {
  res.send("Hola desde el BackendStored");
});


export default router;