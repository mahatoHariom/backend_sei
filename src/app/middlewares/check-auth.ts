import ApiError from '@/infrastructure/config/ApiError'
import { validateAccessToken } from '@/domain/utils/jwt'
import { User } from '@prisma/client'
import { FastifyRequest } from 'fastify'
import { Messages, StatusCode } from '@/domain/constants/messages'

// Middleware to check if user is authenticated
const CheckAuthenticated = async (request: FastifyRequest) => {
  const authHeader = request.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(Messages.TOKEN_NOT_FOUND, StatusCode.Unauthorized)
  }
  
  const token = authHeader.split(' ')[1]
  
  try {
    const decoded = await validateAccessToken(token)
    if (!decoded) {
      throw new ApiError(Messages.INVALID_OR_TOKEN_EXPIRES, StatusCode.Unauthorized)
    }
    
    request.user = decoded as User
  } catch (error) {
    throw new ApiError(Messages.INVALID_OR_TOKEN_EXPIRES, StatusCode.Unauthorized)
  }
}

export default CheckAuthenticated 