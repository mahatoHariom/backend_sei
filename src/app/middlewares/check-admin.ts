import ApiError from '@/infrastructure/config/ApiError'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { Messages, StatusCode } from '@/domain/constants/messages'

const CheckAdminRole = (server: FastifyInstance) => {
  server.decorate('checkAdmin', async (req: FastifyRequest) => {
    if (!req.user) {
      throw new ApiError(Messages.USER_NOT_AUTHENTICATED, StatusCode.Unauthorized)
    }
    const user = req.user
    if (user.role !== 'admin') {
      throw new ApiError(Messages.FORBIDDEN_ACCESS, StatusCode.Forbidden)
    }
  })
}

export default CheckAdminRole
