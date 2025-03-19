/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiError from '@/infrastructure/config/ApiError'
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

export const errorHandler = (error: FastifyError | ApiError | Error, request: FastifyRequest, reply: FastifyReply) => {
  console.log(error, 'error')
  if (error instanceof ApiError) {
    reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.statusMessage,
      message: error.message
    })
  } else if ((error as any).code === 'P2002') {
    reply.status(409).send({
      statusCode: 409,
      error: 'Conflict',
      message: 'A record with the same unique field already exists, such as an email or username'
    })
  } else {
    // Handle any other unexpected errors
    reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    })
  }
}
