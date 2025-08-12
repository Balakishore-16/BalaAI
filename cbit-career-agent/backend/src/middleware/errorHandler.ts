import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ERROR_MESSAGES } from '../../../shared/src/constants';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?._id
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      ...error,
      message,
      statusCode: 404,
      isOperational: true
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    const message = `${field} already exists`;
    error = {
      ...error,
      message,
      statusCode: 400,
      isOperational: true
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = {
      ...error,
      message,
      statusCode: 400,
      isOperational: true
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      ...error,
      message,
      statusCode: 401,
      isOperational: true
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      ...error,
      message,
      statusCode: 401,
      isOperational: true
    };
  }

  // Multer errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    let statusCode = 400;

    switch ((err as any).code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large';
        statusCode = 413;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        statusCode = 413;
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        statusCode = 400;
        break;
      default:
        message = (err as any).message;
    }

    error = {
      ...error,
      message,
      statusCode,
      isOperational: true
    };
  }

  // Rate limiting errors
  if (err.message && err.message.includes('Too many requests')) {
    error = {
      ...error,
      message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      statusCode: 429,
      isOperational: true
    };
  }

  // OpenAI API errors
  if (err.message && err.message.includes('OpenAI')) {
    error = {
      ...error,
      message: ERROR_MESSAGES.AI_SERVICE_ERROR,
      statusCode: 503,
      isOperational: true
    };
  }

  // Notification service errors
  if (err.message && (err.message.includes('Telegram') || err.message.includes('Twilio') || err.message.includes('Email'))) {
    error = {
      ...error,
      message: ERROR_MESSAGES.NOTIFICATION_ERROR,
      statusCode: 503,
      isOperational: true
    };
  }

  // Database errors
  if (err.message && (err.message.includes('MongoDB') || err.message.includes('database'))) {
    error = {
      ...error,
      message: ERROR_MESSAGES.DATABASE_ERROR,
      statusCode: 503,
      isOperational: true
    };
  }

  // Default error
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  if (!error.message) {
    error.message = ERROR_MESSAGES.INTERNAL_ERROR;
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.stack,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

export const notFound = (req: Request, res: Response): void => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  
  res.status(404).json({
    success: false,
    message: ERROR_MESSAGES.NOT_FOUND,
    error: `Route ${req.method} ${req.url} not found`
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createError = (message: string, statusCode: number = 500, code?: string): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  error.code = code;
  return error;
};