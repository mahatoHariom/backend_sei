import { FastifyReply, FastifyRequest } from 'fastify'
import { id, inject, injectable } from 'inversify'
import { generateJsonWebToken, generateRefreshToken } from '@/domain/utils/jwt'
import { LoginUserInput, CreateUserInput } from '@/domain/schemas/auth-schemas'
import { AuthService } from '../services/auth-service'
import { TYPES } from '@/types'
import ApiError from '@/infrastructure/config/ApiError'
import axios from 'axios'
import { safeStringify } from '@/domain/utils/safe-json'
import { generateHmacSha256Hash } from '@/domain/utils/create-payment-hash'
import { esewaConfig } from '@/infrastructure/config/esewa'
import { PaymentData } from '@/types/payment'
import { Messages, StatusCode } from '@/domain/constants/messages'
import { User, UserRole } from '@prisma/client'
import { JwtPayload } from 'jsonwebtoken'

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private authService: AuthService) {}

  async authenticate(request: FastifyRequest<{ Body: LoginUserInput }>, reply: FastifyReply) {
    const { email, password } = request.body
    const user = await this.authService.authenticate({ email, password })

    if (!user) {
      throw new ApiError(Messages.INVALID_CREDENTIAL, StatusCode.Unauthorized)
    }

    const refreshToken = await generateRefreshToken(user)
    const accessToken = await generateJsonWebToken(user)

    console.log(JSON.stringify(user), 'user')

    reply.setCookie(
      'user',
      JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        userDetail: user.userDetail
      }),
      {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      }
    )

    return reply.status(200).send({ accessToken, refreshToken, user })
  }

  async register(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
    const { email, fullName, password, confirmPassword } = request.body
    const user = await this.authService.register({ email, fullName, password, confirmPassword })

    reply.setCookie(
      'user',
      JSON.stringify({
        user
      }),
      {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      }
    )

    return reply.status(201).send(user)
  }
  async getProfileData(request: FastifyRequest, reply: FastifyReply) {
    const user = await this.authService.getProfileData(request?.user?.id)

    if (!user) {
      throw new ApiError(Messages.USER_NOT_FOUND, StatusCode.NotFound)
    }
    console.log('yoyo', user)
    return reply.status(201).send(user)
  }
  async initiateEsewaPayment(request: FastifyRequest, reply: FastifyReply) {
    const { amount, productId } = request.body as { amount: number; productId: string }

    if (!amount || amount <= 0) {
      throw new ApiError(Messages.AMOUNT_MUST_BE_GREATER, StatusCode.BadRequest)
    }

    let paymentData: PaymentData = {
      amount,
      failure_url: esewaConfig.failureUrl as string,
      product_delivery_charge: '0',
      product_service_charge: '0',
      product_code: esewaConfig.merchantId as string,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      success_url: esewaConfig.successUrl as string,
      tax_amount: '0',
      total_amount: amount,
      transaction_uuid: productId
    }
    const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`
    const signature = await generateHmacSha256Hash(data, esewaConfig.secret)
    paymentData = { ...paymentData, signature }

    try {
      const payment = await axios.post(esewaConfig.esewaPaymentUrl as string, null, {
        params: paymentData
      })
      const reqPayment = JSON.parse(safeStringify(payment))
      if (reqPayment.status === 200) {
        return reply.send({
          url: reqPayment.request.res.responseUrl
        })
      }
    } catch (error) {
      throw new ApiError(Messages.PAYMENT_FAILED, StatusCode.InternalServerError)
      // return reply.status(500).send({ error: 'Payment initiation failed' })
    }

    return reply.send({ esewaUrl: paymentData.success_url })
  }

  async refresh(request: FastifyRequest<{ Body: { refreshToken: string } }>, reply: FastifyReply) {
    const refreshToken = request.body.refreshToken

    if (!refreshToken) {
      throw new ApiError(Messages.USER_NOT_FOUND, StatusCode.NotFound)
    }

    const data = await this.authService.verifyRefreshToken(refreshToken)
    console.log(data, 'this')
    if (!data) {
      throw new ApiError(Messages.INVALID_OR_TOKEN_EXPIRES, StatusCode.Unauthorized)
    }

    const user = await this.authService.getProfileData(data.id as string)

    if (!user) {
      throw new ApiError(Messages.USER_NOT_FOUND, StatusCode.NotFound)
    }

    // Generate new tokens
    const accessToken = await generateJsonWebToken(user)
    // const newRefreshToken = await generateRefreshToken(user)

    return reply.status(200).send({ accessToken })
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie('refreshToken', {
      path: '/',
      secure: false,
      sameSite: 'strict',
      httpOnly: true
    })

    reply.clearCookie('accessToken', {
      path: '/',
      secure: false,
      sameSite: 'strict',
      httpOnly: true
    })

    reply.clearCookie('user', {
      path: '/',
      secure: false,
      sameSite: 'strict',
      httpOnly: true
    })

    return reply.status(200).send()
  }
}
