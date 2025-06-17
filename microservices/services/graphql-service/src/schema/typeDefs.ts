import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  # Basic Types
  type HealthCheck {
    status: String!
    service: String!
    timestamp: String!
  }

  # User Types
  type User {
    id: ID!
    email: String!
    fornavn: String!
    etternavn: String!
    rolle: UserRole!
    bedrift: Bedrift
    bedriftId: String!
    telefon: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relationships
    quizResults: [QuizResult!]!
    sikkerhetskontroller: [SikkerhetskontrollResult!]!
    invoices: [Invoice!]!
  }

  enum UserRole {
    ADMIN
    HOVEDBRUKER
    BRUKER
    ELEV
  }

  # Bedrift Types
  type Bedrift {
    id: ID!
    navn: String!
    organisasjonsnummer: String
    epost: String
    telefon: String
    adresse: String
    postnummer: String
    poststed: String
    isActive: Boolean!
    createdAt: DateTime!
    
    # Relationships
    ansatte: [User!]!
    quizzes: [Quiz!]!
    invoices: [Invoice!]!
    expenses: [Expense!]!
  }

  # Quiz Types
  type Quiz {
    id: ID!
    tittel: String!
    beskrivelse: String
    kategori: String!
    vanskelighetsgrad: String!
    tidsgrense: Int
    passingScore: Int!
    isActive: Boolean!
    createdAt: DateTime!
    
    # Relationships
    sporsmal: [Sporsmal!]!
    results: [QuizResult!]!
  }

  type Sporsmal {
    id: ID!
    tekst: String!
    type: String!
    alternativer: [String!]!
    riktigSvar: String!
    poeng: Int!
    quiz: Quiz!
    quizId: String!
  }

  type QuizResult {
    id: ID!
    score: Int!
    maxScore: Int!
    passed: Boolean!
    timeSpent: Int
    completedAt: DateTime!
    
    # Relationships
    user: User!
    userId: String!
    quiz: Quiz!
    quizId: String!
    answers: [QuizAnswer!]!
  }

  type QuizAnswer {
    id: ID!
    svar: String!
    isCorrect: Boolean!
    poengGitt: Int!
    
    # Relationships
    sporsmal: Sporsmal!
    sporsmalId: String!
    result: QuizResult!
    resultId: String!
  }

  # Sikkerhetskontroll Types
  type SikkerhetskontrollResult {
    id: ID!
    kontrollType: String!
    status: String!
    score: Int
    maxScore: Int
    kommentarer: String
    completedAt: DateTime!
    
    # Relationships
    user: User!
    userId: String!
    checkpoints: [CheckpointResponse!]!
  }

  type CheckpointResponse {
    id: ID!
    svar: String!
    kommentar: String
    photoUrl: String
    timestamp: DateTime!
    
    # Relationships
    result: SikkerhetskontrollResult!
    resultId: String!
  }

  # Economy Types
  type Invoice {
    id: ID!
    invoiceNumber: String!
    status: InvoiceStatus!
    subtotal: Float!
    rabatt: Float!
    rabattBelop: Float!
    mvaRate: Float!
    mvaBelop: Float!
    totalBelop: Float!
    forfallsdato: DateTime!
    betalingsdato: DateTime
    kommentarer: String
    createdAt: DateTime!
    
    # Relationships
    bedrift: Bedrift!
    bedriftId: String!
    kunde: Kunde
    kundeId: String
    fakturaLinjer: [FakturaLinje!]!
  }

  enum InvoiceStatus {
    DRAFT
    SENT
    PAID
    OVERDUE
    CANCELLED
  }

  type FakturaLinje {
    id: ID!
    beskrivelse: String!
    antall: Float!
    enhetspris: Float!
    total: Float!
    
    # Relationships
    invoice: Invoice!
    invoiceId: String!
  }

  type Kunde {
    id: ID!
    navn: String!
    epost: String
    telefon: String
    adresse: String
    
    # Relationships
    invoices: [Invoice!]!
  }

  type Expense {
    id: ID!
    beskrivelse: String!
    belop: Float!
    kategori: String!
    dato: DateTime!
    kvittering: String
    
    # Relationships
    bedrift: Bedrift!
    bedriftId: String!
    opprettetAv: User!
    opprettetAvId: String!
  }

  # Analytics Types
  type QuizStatistics {
    totalQuizzes: Int!
    totalAttempts: Int!
    averageScore: Float!
    passRate: Float!
    popularCategories: [CategoryStats!]!
  }

  type CategoryStats {
    kategori: String!
    attempts: Int!
    averageScore: Float!
    passRate: Float!
  }

  type FinancialSummary {
    totalInvoices: Int!
    totalRevenue: Float!
    pendingAmount: Float!
    overdueAmount: Float!
    totalExpenses: Float!
    netIncome: Float!
    monthlyTrend: [MonthlyFinancial!]!
  }

  type MonthlyFinancial {
    month: String!
    revenue: Float!
    expenses: Float!
    netIncome: Float!
  }

  # Input Types
  input UserInput {
    email: String!
    fornavn: String!
    etternavn: String!
    rolle: UserRole!
    telefon: String
    bedriftId: String!
  }

  input BedriftInput {
    navn: String!
    organisasjonsnummer: String
    epost: String
    telefon: String
    adresse: String
    postnummer: String
    poststed: String
  }

  input QuizInput {
    tittel: String!
    beskrivelse: String
    kategori: String!
    vanskelighetsgrad: String!
    tidsgrense: Int
    passingScore: Int!
  }

  input InvoiceInput {
    kundeId: String
    fakturaLinjer: [FakturaLinjeInput!]!
    forfallsdato: DateTime!
    mvaRate: Float
    rabatt: Float
    kommentarer: String
  }

  input FakturaLinjeInput {
    beskrivelse: String!
    antall: Float!
    enhetspris: Float!
  }

  input ExpenseInput {
    beskrivelse: String!
    belop: Float!
    kategori: String!
    dato: DateTime!
    kvittering: String
  }

  # Filter and Pagination Types
  input PaginationInput {
    page: Int = 1
    limit: Int = 20
  }

  input DateRangeInput {
    startDate: DateTime
    endDate: DateTime
  }

  input UserFilter {
    rolle: UserRole
    bedriftId: String
    isActive: Boolean
    search: String
  }

  input QuizFilter {
    kategori: String
    vanskelighetsgrad: String
    isActive: Boolean
    search: String
  }

  input InvoiceFilter {
    status: InvoiceStatus
    dateRange: DateRangeInput
    kundeId: String
    search: String
  }

  # Response Types
  type PaginatedUsers {
    users: [User!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type PaginatedQuizzes {
    quizzes: [Quiz!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type PaginatedInvoices {
    invoices: [Invoice!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  # Queries
  type Query {
    # Basic Queries
    hello: String!
    healthCheck: HealthCheck!
    
    # User Queries
    me: User
    user(id: ID!): User
    users(filter: UserFilter, pagination: PaginationInput): PaginatedUsers!
    
    # Bedrift Queries
    bedrift(id: ID!): Bedrift
    bedrifter(pagination: PaginationInput): [Bedrift!]!
    
    # Quiz Queries
    quiz(id: ID!): Quiz
    quizzes(filter: QuizFilter, pagination: PaginationInput): PaginatedQuizzes!
    quizResult(id: ID!): QuizResult
    quizResults(userId: String, quizId: String): [QuizResult!]!
    
    # Sikkerhetskontroll Queries
    sikkerhetskontrollResult(id: ID!): SikkerhetskontrollResult
    sikkerhetskontrollResults(userId: String): [SikkerhetskontrollResult!]!
    
    # Economy Queries
    invoice(id: ID!): Invoice
    invoices(filter: InvoiceFilter, pagination: PaginationInput): PaginatedInvoices!
    expense(id: ID!): Expense
    expenses(bedriftId: String!, pagination: PaginationInput): [Expense!]!
    
    # Analytics Queries
    quizStatistics(bedriftId: String!, dateRange: DateRangeInput): QuizStatistics!
    financialSummary(bedriftId: String!, dateRange: DateRangeInput): FinancialSummary!
    
    # Dashboard Queries
    dashboard(bedriftId: String!): DashboardData!
  }

  type DashboardData {
    userCount: Int!
    activeQuizzes: Int!
    pendingInvoices: Int!
    recentActivity: [Activity!]!
    quizStatistics: QuizStatistics!
    financialSummary: FinancialSummary!
  }

  type Activity {
    id: ID!
    type: String!
    description: String!
    userId: String
    userName: String
    timestamp: DateTime!
    metadata: JSON
  }

  # Mutations
  type Mutation {
    # Basic Mutations
    ping: String!
    
    # User Mutations
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): Boolean!
    
    # Bedrift Mutations
    createBedrift(input: BedriftInput!): Bedrift!
    updateBedrift(id: ID!, input: BedriftInput!): Bedrift!
    
    # Quiz Mutations
    createQuiz(input: QuizInput!): Quiz!
    updateQuiz(id: ID!, input: QuizInput!): Quiz!
    deleteQuiz(id: ID!): Boolean!
    startQuiz(quizId: ID!): QuizSession!
    submitQuizAnswer(sessionId: ID!, sporsmalId: ID!, svar: String!): Boolean!
    completeQuiz(sessionId: ID!): QuizResult!
    
    # Economy Mutations
    createInvoice(input: InvoiceInput!): Invoice!
    updateInvoice(id: ID!, input: InvoiceInput!): Invoice!
    sendInvoice(id: ID!): Invoice!
    payInvoice(id: ID!, betalingsdato: DateTime!, betalingsmetode: String!): Invoice!
    cancelInvoice(id: ID!, arsak: String!): Invoice!
    
    createExpense(input: ExpenseInput!): Expense!
    updateExpense(id: ID!, input: ExpenseInput!): Expense!
    deleteExpense(id: ID!): Boolean!
  }

  type QuizSession {
    id: ID!
    quizId: String!
    userId: String!
    startedAt: DateTime!
    expiresAt: DateTime
    currentSporsmalIndex: Int!
    isCompleted: Boolean!
  }

  # Subscriptions for Real-time Updates
  type Subscription {
    # Quiz Subscriptions
    quizCompleted(bedriftId: String!): QuizResult!
    quizStarted(bedriftId: String!): QuizSession!
    
    # Invoice Subscriptions
    invoiceStatusChanged(bedriftId: String!): Invoice!
    newInvoice(bedriftId: String!): Invoice!
    
    # User Activity Subscriptions
    userActivity(bedriftId: String!): Activity!
    
    # Notification Subscriptions
    notifications(userId: String!): Notification!
  }

  type Notification {
    id: ID!
    title: String!
    message: String!
    type: NotificationType!
    userId: String!
    isRead: Boolean!
    createdAt: DateTime!
    metadata: JSON
  }

  enum NotificationType {
    INFO
    SUCCESS
    WARNING
    ERROR
    QUIZ_COMPLETED
    INVOICE_PAID
    SIKKERHETSKONTROLL_DUE
  }
`; 