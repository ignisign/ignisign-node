
import {Router, Application, RequestHandler, NextFunction, Request, Response} from "express";

export const jsonSuccess = <T = any>(res : Response, obj : T) => {
  res.status(200).json(obj);
}