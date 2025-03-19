import dotenv from 'dotenv'

export function loadEnvironment() {
  dotenv.config()

  const requiredEnvVars = ['JWT_SECRET', 'CLIENT_ENDPOINT', 'DATABASE_URL']

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  }
}
