declare module 'chart.js' {
  export interface ChartConfiguration {
    type: ChartType
    data: ChartData
    options?: ChartOptions
  }

  export interface ChartAnimationOptions {
    duration?: number
    easing?: string
    delay?: number | ((context: any) => number)
    loop?: boolean
    from?: number
    to?: number
    onProgress?: (animation: { currentStep: number; numSteps: number }) => void
    onComplete?: (animation: { initial: boolean; chart: Chart }) => void
  }

  export interface ChartHoverOptions {
    mode?: 'point' | 'nearest' | 'index' | 'dataset' | 'x' | 'y'
    intersect?: boolean
    animationDuration?: number
  }

  export interface ChartData {
    labels?: string[]
    datasets: ChartDataset[]
  }

  export interface ChartDataset {
    label?: string
    data: (number | null)[]
    type?: ChartType
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    borderDash?: number[]
    borderDashOffset?: number
    borderCapStyle?: 'butt' | 'round' | 'square'
    borderJoinStyle?: 'bevel' | 'round' | 'miter'
    tension?: number
    fill?: boolean
    hoverBackgroundColor?: string | string[]
    hoverBorderColor?: string | string[]
    hoverBorderWidth?: number
    hoverRadius?: number
    pointStyle?: string | HTMLImageElement
    pointRadius?: number
    pointHoverRadius?: number
  }

  export interface ChartOptions {
    responsive?: boolean
    aspectRatio?: number
    maintainAspectRatio?: boolean
    animation?: ChartAnimationOptions | false
    transitions?: {
      active?: {
        animation: ChartAnimationOptions
      }
    }
    hover?: ChartHoverOptions
    interaction?: {
      mode?: 'point' | 'nearest' | 'index' | 'dataset' | 'x' | 'y'
      intersect?: boolean
      axis?: 'x' | 'y' | 'xy'
    }
    plugins?: {
      title?: {
        display?: boolean
        text?: string
        position?: 'top' | 'bottom' | 'left' | 'right'
      }
      legend?: {
        display?: boolean
        position?: 'top' | 'bottom' | 'left' | 'right'
      }
      tooltip?: {
        enabled?: boolean
        mode?: 'point' | 'nearest' | 'index' | 'dataset' | 'x' | 'y'
        intersect?: boolean
      }
    }
    scales?: {
      x?: ScaleOptions
      y?: ScaleOptions
    }
    onHover?: (event: ChartEvent, elements: ChartElement[]) => void
    onClick?: (event: ChartEvent, elements: ChartElement[]) => void
  }

  export interface ScaleOptions {
    type?: 'linear' | 'logarithmic' | 'category' | 'time'
    display?: boolean
    position?: 'left' | 'right' | 'top' | 'bottom'
    beginAtZero?: boolean
    min?: number
    max?: number
    title?: {
      display?: boolean
      text?: string
    }
    grid?: {
      display?: boolean
      color?: string
      borderColor?: string
    }
    ticks?: {
      callback?: (value: any) => string
      stepSize?: number
      maxTicksLimit?: number
    }
  }

  export interface ChartElement {
    index: number
    datasetIndex: number
    element?: {
      x: number
      y: number
    }
  }

  export interface ChartEvent {
    native: Event
    x: number
    y: number
  }

  export type ChartType = 'line' | 'bar' | 'radar' | 'doughnut' | 'pie' | 'polarArea' | 'bubble' | 'scatter'

  export class Chart<T extends ChartType = ChartType> {
    constructor(
      ctx: string | CanvasRenderingContext2D | HTMLCanvasElement | null,
      config: ChartConfiguration
    )

    destroy(): void
    update(mode?: 'none' | 'normal' | 'reset' | 'resize' | 'show'): void
    show(datasetIndex: number, index: number): void
    hide(datasetIndex: number, index: number): void
    toBase64Image(): string
    
    static register(...components: any[]): void
    static getChart(canvas: HTMLCanvasElement): Chart | undefined
  }

  // Required components
  export class CategoryScale {
    static id: string
  }

  export class LinearScale {
    static id: string
  }

  export class PointElement {
    static id: string
  }

  export class LineElement {
    static id: string
  }

  export class BarElement {
    static id: string
  }

  export class Title {
    static id: string
  }

  export class Tooltip {
    static id: string
  }

  export class Legend {
    static id: string
  }
}