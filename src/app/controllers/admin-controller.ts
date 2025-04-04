import { FastifyReply, FastifyRequest } from 'fastify'
import { inject, injectable } from 'inversify'
import { TYPES } from '@/types'
import { Contact, User } from '@prisma/client'
import { AdminService } from '../services/admin-service'
import ApiError from '@/infrastructure/config/ApiError'
import { StatusCode } from '@/domain/constants/messages'
// import { ApiError } from '@/utils/'
// import { StatusCode } from '@/utils/status-code'

@injectable()
export class AdminController {
  constructor(@inject(TYPES.AdminService) private adminService: AdminService) {}

  async createCarousel(request: FastifyRequest, reply: FastifyReply) {
    if (!request.file) {
      throw new Error('No carousel image uploaded')
    }

    const file = request.file as any
    const imageUrl = `/uploads/${file.filename}`

    await this.adminService.createCarousel({
      imageUrl
    })

    reply.status(201).send()
  }

  // Update carousel
  async updateCarousel(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params

    if (!request.file) {
      throw new Error('No carousel image uploaded')
    }

    const file = request.file as any
    const imageUrl = `/uploads/${file.filename}`

    await this.adminService.updateCarousel({
      id,
      imageUrl
    })

    reply.status(200).send()
  }

  // Delete carousel
  async deleteCarousel(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params
    await this.adminService.deleteCarousel(id)
    reply.status(200).send()
  }

  // Get all carousels
  async getCarousels(
    request: FastifyRequest<{
      Querystring: { page?: number; limit?: number; search?: string }
    }>,
    reply: FastifyReply
  ) {
    const { page = 1, limit = 10, search } = request.query
    const result = await this.adminService.getCarousels(page, limit, search)
    reply.status(200).send(result)
  }

  async getEnrolledUsers(
    request: FastifyRequest<{
      Querystring: { page?: number; limit?: number; search?: string }
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { page = 1, limit = 10, search } = request.query

    const {
      enrollments,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
      hasPreviousPage,
      hasNextPage
    } = await this.adminService.getEnrolledUsers(Number(page), Number(limit), search)

    return reply.status(200).send({
      enrollments,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
      hasPreviousPage,
      hasNextPage
    })
  }

  async getAllUsers(
    request: FastifyRequest<{
      Querystring: { page?: number; limit?: number; search?: string }
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { page = 1, limit = 10, search } = request.query

    const {
      users,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
      hasPreviousPage,
      hasNextPage
    } = await this.adminService.getAllUsers(Number(page), Number(limit), search)

    return reply.status(200).send({
      users,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
      hasPreviousPage,
      hasNextPage
    })
  }

  async getAllContact(
    request: FastifyRequest<{
      Querystring: { page?: number; limit?: number; search?: string }
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const { page = 1, limit = 10, search } = request.query

    const {
      contacts,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
      hasPreviousPage,
      hasNextPage
    } = await this.adminService.getAllContact(Number(page), Number(limit), search)

    return reply.status(200).send({
      contacts,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
      hasPreviousPage,
      hasNextPage
    })
  }

  async editContact(
    request: FastifyRequest<{
      Body: { name: string; email: string; message: string; phone: string }
      Params: { contactId: string }
    }>,
    reply: FastifyReply
  ) {
    const { name, email, message, phone } = request.body
    const { contactId } = request.params
    await this.adminService.editContact({
      contactId,
      name,
      email,
      message,
      phone
    })
    reply.status(200).send()
  }

  async deleteContact(request: FastifyRequest<{ Params: { contactId: string } }>, reply: FastifyReply) {
    const { contactId } = request.params
    await this.adminService.deleteContact({ contactId })
    reply.status(200).send()
  }

  async deleteUser(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply): Promise<void> {
    const { userId } = request.params
    await this.adminService.deleteUser({ userId })
    reply.status(200).send()
  }

  async exportUsersAsCSV(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const csvData = await this.adminService.exportUsersAsCSV()

    reply
      .header('Content-Type', 'text/csv')
      .header('Content-Disposition', 'attachment; filename=users.csv')
      .send(csvData)
  }

  async importUsersFromCSV(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const file = request.file

    if (!file) {
      throw new ApiError('CSV file is required', StatusCode.BadRequest)
    }
    const csvBuffer = await file()
    if (!csvBuffer) {
      throw new ApiError('Error reading CSV file', StatusCode.BadRequest)
    }

    await this.adminService.importUsersFromCSV(await csvBuffer.toBuffer())

    reply.status(200).send({ message: 'Users imported successfully' })
  }

  async getDashboardStats(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const stats = await this.adminService.getDashboardStats()
    reply.status(200).send(stats)
  }

  async createSubject(
    request: FastifyRequest<{
      Body: {
        name: string
        description?: string
      }
    }>,
    reply: FastifyReply
  ) {
    const { name, description } = request.body

    await this.adminService.createSubject({
      name,
      description
    })

    reply.status(200).send()
  }

  async editSubject(
    request: FastifyRequest<{
      Body: {
        name?: string
        description?: string
      }
      Params: { subjectId: string }
    }>,
    reply: FastifyReply
  ) {
    const { name, description } = request.body
    const { subjectId } = request.params

    await this.adminService.editSubject({
      subjectId,
      name,
      description
    })

    reply.status(200).send()
  }

  async deleteSubject(request: FastifyRequest<{ Params: { subjectId: string } }>, reply: FastifyReply) {
    const { subjectId } = request.params
    const data = await this.adminService.deleteSubject({
      subjectId
    })
    reply.status(200).send()
  }
}
