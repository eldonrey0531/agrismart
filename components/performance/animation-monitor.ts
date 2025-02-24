/**
 * Animation performance metrics interface 
 */
export interface PerformanceMetrics {
  fps: number
  frameTime: number
  jank: number
  dropped: number
  totalFrames: number
}

/**
 * Frame data interface
 */
interface Frame {
  timestamp: number
  duration: number
}

/**
 * Animation Monitor Options
 */
export interface AnimationMonitorOptions {
  targetFps?: number
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
}

/**
 * Animation Performance Monitor
 */
export class AnimationMonitor {
  private frames: Frame[] = []
  private startTime: number = 0
  private isRunning: boolean = false
  private rafId?: number
  private targetFps: number = 60
  private frameInterval: number = 1000 / 60
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    jank: 0,
    dropped: 0,
    totalFrames: 0
  }

  private onMetricsUpdate?: (metrics: PerformanceMetrics) => void

  constructor(options?: AnimationMonitorOptions) {
    if (options?.targetFps) {
      this.targetFps = options.targetFps
      this.frameInterval = 1000 / this.targetFps
    }
    this.onMetricsUpdate = options?.onMetricsUpdate
  }

  /**
   * Start monitoring
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.startTime = performance.now()
    this.frames = []
    this.monitor()
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isRunning = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Monitor frame timing
   */
  private monitor = (): void => {
    const timestamp = performance.now()
    
    if (this.frames.length > 0) {
      const lastFrame = this.frames[this.frames.length - 1]
      const frameDuration = timestamp - lastFrame.timestamp
      
      this.frames.push({ timestamp, duration: frameDuration })
      
      // Keep last 60 frames for analysis
      if (this.frames.length > 60) {
        this.frames.shift()
      }
      
      this.updateMetrics()
    } else {
      this.frames.push({ timestamp, duration: 0 })
    }

    if (this.isRunning) {
      this.rafId = requestAnimationFrame(this.monitor)
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    const totalDuration = this.frames.reduce((sum, frame) => sum + frame.duration, 0)
    const avgFrameTime = totalDuration / this.frames.length
    const currentFps = 1000 / avgFrameTime
    
    // Count dropped frames and jank
    const dropped = this.frames.reduce((count, frame) => 
      count + Math.floor(frame.duration / this.frameInterval), 0
    ) - this.frames.length

    const jank = this.frames.filter(frame => 
      frame.duration > this.frameInterval * 1.5
    ).length

    this.metrics = {
      fps: Math.round(currentFps),
      frameTime: Math.round(avgFrameTime),
      jank,
      dropped,
      totalFrames: this.frames.length
    }

    if (this.onMetricsUpdate) {
      this.onMetricsUpdate(this.metrics)
    }
  }

  /**
   * Check if performance is acceptable
   */
  isPerformant(): boolean {
    const { fps, jank, dropped } = this.metrics
    return fps >= this.targetFps * 0.9 && // Within 90% of target FPS
           jank <= 5 && // Max 5 janky frames
           dropped <= 2 // Max 2 dropped frames
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    const { fps, jank, dropped } = this.metrics
    
    const fpsScore = Math.min(100, (fps / this.targetFps) * 100)
    const jankScore = Math.max(0, 100 - (jank * 10))
    const droppedScore = Math.max(0, 100 - (dropped * 20))
    
    return Math.round((fpsScore + jankScore + droppedScore) / 3)
  }

  /**
   * Get performance report
   */
  getReport(): string {
    const { fps, frameTime, jank, dropped, totalFrames } = this.metrics
    const score = this.getPerformanceScore()
    const performant = this.isPerformant()

    return `
Performance Report:
-----------------
Score: ${score}/100 (${performant ? 'Good' : 'Needs Improvement'})
FPS: ${fps}/${this.targetFps}
Frame Time: ${frameTime}ms
Jank: ${jank} frames
Dropped: ${dropped} frames
Total Frames: ${totalFrames}
    `.trim()
  }
}