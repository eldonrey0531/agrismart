import { PrismaClient, Prisma } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

type PrismaLogLevel = 'query' | 'info' | 'warn' | 'error'

const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: (process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error']) as PrismaLogLevel[]
}

class PrismaService {
  private static instance: PrismaClient
  private queryCount: number = 0
  private queryTimes: number[] = []

  private constructor() {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient(prismaClientOptions)

      // Query monitoring in development
      if (process.env.NODE_ENV === 'development') {
        this.setupEventListeners()
        this.startPerformanceMonitoring()
      }

      // Handle initial connection
      this.connect()
    }
  }

  private setupEventListeners() {
    const client = PrismaService.instance
    
    // Using type assertion for event handling
    ;(client as any).$on('query', (event: Prisma.QueryEvent) => {
      this.queryCount++
      this.queryTimes.push(event.duration)
      
      if (process.env.DEBUG === 'true') {
        console.log(`Query ${this.queryCount}:`, {
          query: event.query,
          params: event.params,
          duration: `${event.duration}ms`
        })
      }
    })

    ;(client as any).$on('error', (event: { message: string; timestamp: Date }) => {
      console.error('Prisma Error:', {
        message: event.message,
        timestamp: event.timestamp
      })
    })

    ;(client as any).$on('warn', (event: { message: string; timestamp: Date }) => {
      console.warn('Prisma Warning:', {
        message: event.message,
        timestamp: event.timestamp
      })
    })
  }

  private async connect() {
    try {
      await PrismaService.instance.$connect()
      console.log('Successfully connected to database')
    } catch (error) {
      console.error('Failed to connect to database:', error)
      process.exit(1)
    }
  }

  private startPerformanceMonitoring() {
    setInterval(() => {
      this.logPerformanceMetrics()
    }, 60000) // Every minute
  }

  private logPerformanceMetrics() {
    if (this.queryTimes.length === 0) return

    const metrics = this.calculateMetrics()
    console.log('Database Performance Metrics:', {
      totalQueries: this.queryCount,
      averageQueryTime: `${metrics.averageQueryTime.toFixed(2)}ms`,
      slowestQuery: `${metrics.slowestQuery}ms`,
      fastestQuery: `${metrics.fastestQuery}ms`,
      timestamp: new Date().toISOString()
    })

    // Reset metrics
    this.resetMetrics()
  }

  private calculateMetrics(): QueryMetrics {
    const avgTime = this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length
    return {
      totalQueries: this.queryCount,
      averageQueryTime: avgTime,
      slowestQuery: Math.max(...this.queryTimes),
      fastestQuery: Math.min(...this.queryTimes),
      timestamp: new Date()
    }
  }

  private resetMetrics() {
    this.queryTimes = []
    this.queryCount = 0
  }

  static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      new PrismaService()
    }
    return PrismaService.instance
  }
}

// Singleton instance for development hot reloading
const prisma = global.prisma || PrismaService.getInstance()

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

// Handle unexpected errors
process.on('unhandledRejection', (error: Error) => {
  console.error('Unhandled Promise Rejection:', error)
})

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

/**
 * Interfaces
 */
interface QueryMetrics {
  totalQueries: number
  averageQueryTime: number
  slowestQuery: number
  fastestQuery: number
  timestamp: Date
}

export type PrismaErrorHandler = (error: Error & { code?: string }) => void

// Export singleton instance
export { prisma }
export default prisma
export type { QueryMetrics }