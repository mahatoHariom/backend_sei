const fastify = require('fastify');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma
const prisma = new PrismaClient();

// Create Fastify server
const server = fastify({
  logger: true
});

// Health check route
server.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Database connection test route
server.get('/api/db-test', async (request, reply) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'Database connection successful', timestamp: new Date().toISOString() };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Database connection failed', message: error.message });
  }
});

// API route to get carousel items
server.get('/api/v1/admin/carousels', async (request, reply) => {
  try {
    const carousels = await prisma.carousel.findMany({
      where: {
        active: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return carousels;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Failed to fetch carousel items', message: error.message });
  }
});

// Get the port from environment variables or use a default
const PORT = process.env.PORT || 9000;

// Start the server
const start = async () => {
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

start(); 