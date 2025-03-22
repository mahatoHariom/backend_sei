import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const subjects = [
  {
    name: 'SCIENCE',
    description:
      'Covers fundamental concepts in Physics, Chemistry, and Biology as per the national curriculum for Class 10 and +2 science streams.'
  },
  {
    name: 'MANAGEMENT',
    description:
      'Focuses on Business Studies, Economics, and Accountancy aligned with the national +2 management stream, preparing students for further business education.'
  },
  {
    name: 'LANGUAGE CLASSES',
    description:
      'Enhances proficiency in languages, primarily Nepali and English, as required by the national education standards across secondary levels.'
  },
  {
    name: 'BASIC COMPUTER CLASS',
    description:
      'Introduces essential computer literacy, including operating systems and basic software applications, in line with modern curriculum needs.'
  },
  {
    name: 'OFFICE PACKAGE COMPUTER CLASS',
    description:
      'Provides training on Microsoft Office tools such as Word, Excel, and PowerPoint to build skills necessary for academic and professional success.'
  },
  {
    name: 'WEB DEVELOPMENT',
    description:
      'Teaches website design and development using HTML, CSS, and JavaScript, equipping students with digital skills applicable in modern workplaces.'
  },
  {
    name: 'APP DEVELOPMENT',
    description:
      'Offers an introduction to mobile application development for Android and iOS platforms, emphasizing practical programming skills and problem-solving.'
  },
  {
    name: 'HA',
    description:
      'Delivers comprehensive training for Health Assistants, covering basic healthcare, community health, and first aid as outlined in national standards.'
  },
  {
    name: 'LAB',
    description:
      'Provides hands-on laboratory training in science and technology subjects to reinforce theoretical concepts with practical experiments.'
  },
  {
    name: 'STAFF NURSE PREPARATION',
    description:
      'Prepares students for nursing careers with a focus on clinical skills, patient care, and healthcare theory in accordance with national certification standards.'
  }
]

async function ensureUploadsDirectoryExists() {
  const uploadsPath = path.join(process.cwd(), 'uploads')
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true })
  }
  return uploadsPath
}

async function copySeedImagesToUploads() {
  // Path to seed images (adjust as needed)
  const seedImagesPath = path.join(process.cwd(), 'prisma', 'seed-images')
  const uploadsPath = await ensureUploadsDirectoryExists()

  // Check if seed images directory exists
  if (!fs.existsSync(seedImagesPath)) {
    console.log('No seed images directory found. Skipping image copy.')
    return []
  }

  // Get all files from seed images
  const files = fs.readdirSync(seedImagesPath).filter((file) => {
    return file.match(/\.(jpg|jpeg|png|gif)$/i)
  })

  // Copy each file to uploads and return the resulting filenames
  return files.map((file) => {
    const newFilename = `seed-${Date.now()}-${file}`
    const sourcePath = path.join(seedImagesPath, file)
    const destinationPath = path.join(uploadsPath, newFilename)

    // Copy the file only if it doesn't already exist
    if (!fs.existsSync(destinationPath)) {
      fs.copyFileSync(sourcePath, destinationPath)
      console.log(`Copied seed image ${file} to uploads`)
    }

    return newFilename
  })
}

async function main() {
  try {
    console.log('Starting database seeding...')

    // Copy seed images to uploads folder
    const imageFiles = await copySeedImagesToUploads()

    // Create admin user if none exists
    const adminExists = await prisma.user.findFirst({
      where: {
        email: 'admin@gmail.com'
      }
    })

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('adminAdmin@@12', 10)
      await prisma.user.create({
        data: {
          fullName: 'Admin User',
          email: 'admin@gmail.com',
          password: hashedPassword,
          isVerified: true,
          role: 'ADMIN'
        }
      })
      console.log('✅ Admin user created successfully')
    } else {
      console.log('ℹ️ Admin user already exists, skipping creation')
    }

    // Create sample courses if they don't exist
    const coursesExist = await prisma.subject.count()

    if (coursesExist < 5) {
      console.log('Creating sample courses...')
      // Delete existing courses for a clean slate
      await prisma.subject.deleteMany({})

      const courses = [
        {
          name: 'Web Development Fundamentals',
          description: 'Learn the basics of web development including HTML, CSS, and JavaScript.',
          difficulty: 'Beginner',
          duration: '8 weeks',
          imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2940&auto=format&fit=crop',
          courseType: 'Certificate',
          tags: ['Technology', 'Web Development', 'Programming'],
          badge: 'Popular',
          students: 128
        },
        {
          name: 'Advanced JavaScript Programming',
          description: 'Master advanced JavaScript concepts including ES6, async programming, and frameworks.',
          difficulty: 'Intermediate',
          duration: '10 weeks',
          imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2970&auto=format&fit=crop',
          courseType: 'Certificate',
          tags: ['Technology', 'JavaScript', 'Programming'],
          badge: 'New',
          students: 87
        },
        {
          name: 'Data Science Essentials',
          description: 'Introduction to data science concepts, tools, and methodologies for beginners.',
          difficulty: 'Beginner',
          duration: '12 weeks',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop',
          courseType: 'Certificate',
          tags: ['Data Science', 'Technology', 'Analytics'],
          badge: 'Featured',
          students: 105
        },
        {
          name: 'Mobile App Development with React Native',
          description: 'Build cross-platform mobile applications using React Native framework.',
          difficulty: 'Intermediate',
          duration: '14 weeks',
          imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=2940&auto=format&fit=crop',
          courseType: 'Diploma',
          tags: ['Mobile Development', 'React', 'Programming'],
          badge: 'Hot',
          students: 92
        },
        {
          name: 'Cybersecurity Fundamentals',
          description: 'Learn about essential concepts in cybersecurity and how to protect digital assets.',
          difficulty: 'Beginner',
          duration: '10 weeks',
          imageUrl: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=2729&auto=format&fit=crop',
          courseType: 'Certificate',
          tags: ['Cybersecurity', 'Technology', 'IT'],
          students: 76
        },
        {
          name: 'UI/UX Design Principles',
          description: 'Master the fundamentals of user interface and user experience design.',
          difficulty: 'Beginner',
          duration: '8 weeks',
          imageUrl: 'https://images.unsplash.com/photo-1545235617-7a424c1a60cc?q=80&w=2880&auto=format&fit=crop',
          courseType: 'Certificate',
          tags: ['Design', 'UI/UX', 'Creative'],
          badge: 'Popular',
          students: 115
        },
        {
          name: 'Machine Learning Bootcamp',
          description: 'Intensive program covering machine learning algorithms and practical applications.',
          difficulty: 'Advanced',
          duration: '16 weeks',
          imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2865&auto=format&fit=crop',
          courseType: 'Bootcamp',
          tags: ['Machine Learning', 'AI', 'Data Science'],
          badge: 'Special',
          students: 64
        },
        {
          name: 'Cloud Computing with AWS',
          description: 'Learn to design, deploy, and manage applications on Amazon Web Services.',
          difficulty: 'Intermediate',
          duration: '12 weeks',
          imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2940&auto=format&fit=crop',
          courseType: 'Certificate',
          tags: ['Cloud Computing', 'AWS', 'DevOps'],
          students: 83
        }
      ]

      for (const course of courses) {
        await prisma.subject.create({
          data: course
        })
      }

      console.log(`✅ ${courses.length} sample courses created successfully`)
    } else {
      console.log('ℹ️ Courses already exist, skipping creation')
    }

    // Add carousel images (if we have seed images)
    if (imageFiles.length > 0) {
      // Get existing carousels
      const existingCarousels = await prisma.carousel.findMany()

      if (existingCarousels.length === 0) {
        // Only seed carousels if none exist
        const carousels = await Promise.all(
          imageFiles.map((file) =>
            prisma.carousel.create({
              data: {
                imageUrl: `/uploads/${file}`
              }
            })
          )
        )
        console.log(`Created ${carousels.length} carousel items`)
      } else {
        console.log(`Skipping carousel creation as ${existingCarousels.length} already exist`)
      }
    }

    console.log('✅ Database seeding completed successfully')
  } catch (error) {
    console.error('❌ Error during database seeding:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('Database connection closed')
  })
  .catch(async (e) => {
    console.error('Failed to seed the database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
