import { Container } from 'inversify'
import { PrismaAuthRepository } from '@/domain/repositories/auth-repository'
import { AuthController } from '../app/controllers/auth-controller'
import { AuthService } from '../app/services/auth-service'
import { TYPES } from '../types'
import { IAuthRepository } from '@/domain/interfaces/auth-interface'
import { UserControllers } from '@/app/controllers/users-controller'
import { UserServices } from '@/app/services/user-service'
import { IUserRepository } from '@/domain/interfaces/users-interface'
import { PrismaUserRepository } from '@/domain/repositories/user-repository'
import { ContactController } from '@/app/controllers/contact-controller'
import { ContactService } from '@/app/services/contact-service'
import { IContactRepository } from '@/domain/interfaces/contact-interface'
import { PrismaContactRepository } from '@/domain/repositories/prtisma-contact-repository'
import { SubjectController } from '@/app/controllers/subject-controller'
import { SubjectService } from '@/app/services/subject-service'
import { ISubjectRepository } from '@/domain/interfaces/subject.interface'
import { PrismaSubjectRepository } from '@/domain/repositories/subject-repository'
import { AdminController } from '@/app/controllers/admin-controller'
import { AdminService } from '@/app/services/admin-service'
import { IAdminRepository } from '@/domain/interfaces/admin.interface'
import { PrismaAdminRepository } from '@/domain/repositories/admin-repository'
import { PdfController } from '@/app/controllers/pdf-controller'
import { PdfService } from '@/app/services/pdf-service'
import { IPdfRepository } from '@/domain/interfaces/pdf-interface'
import { PrismaPdfRepository } from '@/domain/repositories/pdf-repository'
import { PracticeController } from '@/app/controllers/practise-controller'

import { IPracticeRepository } from '@/domain/interfaces/practise.interface'
import { PrismaPracticeRepository } from '@/domain/repositories/practise-repository'
import { AIService } from '@/app/services/ai-service'
import { PracticeService } from '@/app/services/practise-service'

const container = new Container()

container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope()

container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope()

container.bind<IAuthRepository>(TYPES.IAuthRepository).to(PrismaAuthRepository).inSingletonScope()

container.bind<UserControllers>(TYPES.UserControllers).to(UserControllers).inSingletonScope()

container.bind<UserServices>(TYPES.UserServices).to(UserServices).inSingletonScope()

container.bind<IUserRepository>(TYPES.IUserRepository).to(PrismaUserRepository).inSingletonScope()

// COntact

container.bind<ContactController>(TYPES.ContactController).to(ContactController).inSingletonScope()

container.bind<ContactService>(TYPES.ContactService).to(ContactService).inSingletonScope()

container.bind<IContactRepository>(TYPES.IContactRepository).to(PrismaContactRepository).inSingletonScope()

// Subject

container.bind<SubjectController>(TYPES.SubjectController).to(SubjectController).inSingletonScope()

container.bind<SubjectService>(TYPES.SubjectService).to(SubjectService).inSingletonScope()

container.bind<ISubjectRepository>(TYPES.ISubjectRepository).to(PrismaSubjectRepository).inSingletonScope()

// Admin

container.bind<AdminController>(TYPES.AdminController).to(AdminController).inSingletonScope()

container.bind<AdminService>(TYPES.AdminService).to(AdminService).inSingletonScope()

container.bind<IAdminRepository>(TYPES.IAdminRepository).to(PrismaAdminRepository).inSingletonScope()

// pdf
container.bind<PdfController>(TYPES.PdfController).to(PdfController).inSingletonScope()

container.bind<PdfService>(TYPES.PdfService).to(PdfService).inSingletonScope()

container.bind<IPdfRepository>(TYPES.IPdfRepository).to(PrismaPdfRepository).inSingletonScope()

container.bind<PracticeController>(TYPES.PracticeController).to(PracticeController).inSingletonScope()
container.bind<PracticeService>(TYPES.PracticeService).to(PracticeService).inSingletonScope()
container.bind<IPracticeRepository>(TYPES.IPracticeRepository).to(PrismaPracticeRepository).inSingletonScope()
container.bind<AIService>(TYPES.AIService).to(AIService).inSingletonScope()

export { container }
