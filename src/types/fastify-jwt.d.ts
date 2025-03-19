import '@fastify/jwt'
import { User } from '@prisma/client'
import { Container } from 'inversify'

// Modify the FastifyJWT declaration
declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: User
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    container: Container
    user: User | {}
  }
}

// declare module 'fastify' {
//   interface FastifyRequest {
//     user: User | null
//   }
// }
