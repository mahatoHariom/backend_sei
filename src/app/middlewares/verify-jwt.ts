import ApiError from '@/infrastructure/config/ApiError'
import { validateAccessToken } from '@/domain/utils/jwt'
import { User } from '@prisma/client'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { Messages, StatusCode } from '@/domain/constants/messages'

const setAuthenticateJWT = (server: FastifyInstance) => {
  server.decorate('authenticate', async (req: FastifyRequest) => {
    console.log(req.headers.authorization, 'hello')
    const token = req.headers.authorization
    console.log(token, 'ppp')

    const accessToken = token?.split(' ')[1]
    console.log(accessToken, 'accessToken')
    if (!token) {
      throw new ApiError(Messages.TOKEN_NOT_FOUND, StatusCode.Unauthorized)
    }
    const decoded = await validateAccessToken(accessToken as string)

    if (!decoded) {
      throw new ApiError(Messages.INVALID_OR_TOKEN_EXPIRES, StatusCode.Unauthorized)
    }
    req.user = decoded as User
  })
}

export default setAuthenticateJWT
