/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHmac } from 'crypto'

export function generateHmacSha256Hash(data: any, secret: any) {
  if (!data || !secret) {
    throw new Error('Both data and secret are required to generate a hash.')
  }

  // Create HMAC SHA256 hash and encode it in Base64
  const hash = createHmac('sha256', secret).update(data).digest('base64')

  return hash
}
