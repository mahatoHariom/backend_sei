export interface EnrollmentWithSubjects {
  user: {
    fullName: string
    email: string
  }
  subjects: {
    name: string
    createdAt: Date
  }[]
}

export interface EnrollmentResponse {
  user: {
    fullName: string
    email: string
  }
  subject: {
    name: string
  }
  createdAt: Date
  allSubjects: {
    name: string
    createdAt: Date
  }[]
}
