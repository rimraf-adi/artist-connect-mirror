import { Request,Response } from "express";
import { response } from "./types";


export const health = (req : Request, res : Response<response<null>>)=>{
const response: response<null> = {
    success: true,
    message: "sab changa si",
    data: null
  };
  
  res.status(200).json(response);
}