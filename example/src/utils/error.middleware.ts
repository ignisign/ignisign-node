import { NextFunction, Request, Response } from 'express';
import * as moment from "moment";

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  let status = 500;
  let message = error.message || 'Something went wrong';

  const timestamp = `${moment().utc().format('YYYY-MM-DD HH:mm:ss ZZ')}`;

  let result :any = { message, timestamp };

  const errorHeaderMessage = `[ERROR] [ ${timestamp} | ${status} ]`;

  console.error(errorHeaderMessage)

  if(error?.name)
    console.error("* Name: ", error?.name);

  if(error?.message)
    console.error("* Message: ", error?.message);

  if(error?.stack)
    console.error("* Stack: ", error?.stack);

  console.error(`------------------------- END ERROR -------------------------`);
  res.status(status).json(result);
}