import createApp from './app'

const startServer = async () => {
  const server = await createApp()
  try {
    server.listen({
      port: Number(process.env.PORT) || 9000,
      host: '0.0.0.0'
    })
    console.log(`HTTP server running on http://localhost:${process.env.PORT}`)
  } catch (err) {
    console.error('Error starting server:', err)
    
    process.exit(1)
  }
}

startServer()
