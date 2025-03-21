const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');
  
  // Check if admin user exists
  const adminUserExists = await prisma.user.findFirst({
    where: {
      email: 'admin@seiinstitute.com',
      role: 'ADMIN'
    }
  });
  
  // Create admin user if not exists
  if (!adminUserExists) {
    console.log('Creating admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('mahato', 10);
    
    await prisma.user.create({
      data: {
        id: uuidv4(),
        email: 'admin@seiinstitute.com',
        fullName: 'Admin User',
        hashedPassword,
        isVerified: true,
        role: 'ADMIN'
      }
    });
    
    console.log('Admin user created successfully.');
  } else {
    console.log('Admin user already exists.');
  }
  
  // Check if there are carousel items
  const carouselCount = await prisma.carousel.count();
  
  // Create carousel items if none exist
  if (carouselCount === 0) {
    console.log('Creating sample carousel items...');
    
    await prisma.carousel.createMany({
      data: [
        {
          id: uuidv4(),
          title: 'Welcome to SEI Institute',
          description: 'Empowering education through technology',
          imageUrl: 'https://example.com/images/carousel1.jpg',
          active: true
        },
        {
          id: uuidv4(),
          title: 'Discover Our Courses',
          description: 'Comprehensive courses for all skill levels',
          imageUrl: 'https://example.com/images/carousel2.jpg',
          active: true
        },
        {
          id: uuidv4(),
          title: 'Join Our Community',
          description: 'Connect with students and educators',
          imageUrl: 'https://example.com/images/carousel3.jpg',
          active: true
        }
      ]
    });
    
    console.log('Sample carousel items created successfully.');
  } else {
    console.log(`${carouselCount} carousel items already exist.`);
  }
  
  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 