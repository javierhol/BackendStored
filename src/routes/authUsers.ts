import { Router } from "express";
const router: Router =  Router();


router.get("/", (req, res) => {
  res.send("Hola desde el BackendStored");
});


export default router;