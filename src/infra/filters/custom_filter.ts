import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { isArray } from 'class-validator';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const env = process.env.NODE_ENV;

    let status;
    let message;

    if (env !== 'production') {
      Logger.error(exception);
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errResponse = exception.getResponse();
      console.log(errResponse);
      if (env === 'production' && status > 499) {
        message = 'INTERNAL_SERVER_ERROR';
      } else if (
        typeof errResponse === 'object' &&
        isArray(errResponse['message'])
      ) {
        message = errResponse['message'][0];
      } else {
        message = errResponse.toString();
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (env === 'production') {
        message = 'INTERNAL_SERVER_ERROR';
      } else {
        message = exception.toString();
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
