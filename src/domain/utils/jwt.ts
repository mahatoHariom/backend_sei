import { User } from '@prisma/client'
import jwt, { JwtPayload } from 'jsonwebtoken'
// import { env } from 'process'
// import { User } from "@/@types/user.type";

export function generateJsonWebToken(data: User) {
  return jwt.sign(data, process.env.JWT_SECRET as string, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES
  })
}
export function generateRefreshToken(data: User) {
  return jwt.sign(data, process.env.JWT_SECRET as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES
  })
}
const validateToken = (token: string): (User & JwtPayload) | null => {
  try {
    const userData = jwt.verify(token, process.env.JWT_SECRET as string) as User
    return userData
  } catch (e) {
    return null
  }
}

// const refreshTokenValidate = (token: string) => {
//   try {
//     console.log(token, 'ref vitra token')
//     const userData = jwt.verify(token, process.env.JWT_SECRET as string)
//     console.log(userData, 'data o')

//     return userData
//   } catch (e) {
//     return null
//   }
// }
export const validateAccessToken = validateToken
// export const validateRefreshToken = refreshTokenValidate
// export const validateRefreshToken = validateToken;
