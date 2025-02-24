export type ReportType = 
  | 'styles' 
  | 'bundle' 
  | 'dependencies' 
  | 'performance' 
  | 'component-performance' 
  | 'full';

export interface BaseReport {
  timestamp: string;
  commit?: string;
  branch?: string;
}

export interface ComponentPerformanceReport extends BaseReport {
  name: string;
  renderTime: number;
  mountTime: number;
  memoryUsage: number;
  interactionTime?: number;
  rerenderTime?: number;
  bundleSize: number;
  memoryLeaks: boolean;
  warnings: string[];
}

export interface StyleReport extends BaseReport {
  totalFiles: number;
  totalUnusedClasses: number;
  totalDuplicateClasses: number;
  totalNonTailwindClasses: number;
  fileAnalysis: Array<{
    filePath: string;
    unusedClasses: string[];
    duplicateClasses: string[];
    nonTailwindClasses: string[];
    totalClasses: number;
  }>;
  suggestions: string[];
}

export interface BundleReport extends BaseReport {
  totalSize: number;
  totalGzipSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzipSize: number;
    dependencies: string[];
  }>;
  largeModules: Array<{
    name: string;
    size: number;
    dependencies: string[];
  }>;
  duplicateDependencies: string[];
  suggestions: string[];
}

export interface DependencyReport extends BaseReport {
  totalDependencies: number;
  unusedDependencies: string[];
  outdatedDependencies: Array<{
    name: string;
    current: string;
    latest: string;
  }>;
  duplicateDependencies: Array<{
    name: string;
    versions: string[];
    locations: string[];
  }>;
  heaviestDependencies: Array<{
    name: string;
    size: number;
    usageCount: number;
  }>;
  suggestions: string[];
}

export interface PerformanceReport extends BaseReport {
  metrics: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
  components: Array<{
    name: string;
    renderTime: number;
    hydrationTime?: number;
    interactionTime?: number;
  }>;
  resources: Array<{
    url: string;
    type: string;
    size: number;
    loadTime: number;
  }>;
  longTasks: Array<{
    duration: number;
    startTime: number;
    name: string;
  }>;
  suggestions: string[];
}

export interface FullReport extends BaseReport {
  styles?: StyleReport;
  bundle?: BundleReport;
  dependencies?: DependencyReport;
  performance?: PerformanceReport;
  componentPerformance?: ComponentPerformanceReport[];
}

export type ReportData = 
  | StyleReport 
  | BundleReport 
  | DependencyReport 
  | PerformanceReport 
  | ComponentPerformanceReport 
  | FullReport;

// Report Format Options
export interface ReportFormatOptions {
  format: 'md' | 'json';
  includeTimestamp?: boolean;
  includeGitInfo?: boolean;
  detailed?: boolean;
}

// Report Generator Options
export interface ReportGeneratorOptions {
  type: ReportType;
  data: ReportData;
  outputDir?: string;
  formats?: Array<'md' | 'json'>;
  notifications?: {
    slack?: string;
    email?: string;
  };
  thresholds?: {
    error?: Record<string, number>;
    warning?: Record<string, number>;
  };
}

// Report Result
export interface ReportResult {
  success: boolean;
  outputFiles: string[];
  errors?: string[];
  warnings?: string[];
}