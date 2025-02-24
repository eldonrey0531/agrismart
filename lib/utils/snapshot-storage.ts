import type { PerformanceSnapshot } from '@/components/performance/debug-utils'

export interface StoredSnapshot extends PerformanceSnapshot {
  id: string
  label?: string
  tags?: string[]
}

export interface SnapshotSearchQuery {
  label?: string
  tags?: string[]
  dateRange?: [Date, Date]
  performanceThreshold?: number
}

/**
 * Performance snapshot storage manager
 */
export class SnapshotStorage {
  private static instance: SnapshotStorage
  private snapshots: StoredSnapshot[] = []

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): SnapshotStorage {
    if (!SnapshotStorage.instance) {
      SnapshotStorage.instance = new SnapshotStorage()
    }
    return SnapshotStorage.instance
  }

  async saveSnapshot(
    snapshot: PerformanceSnapshot,
    options?: {
      label?: string
      tags?: string[]
    }
  ): Promise<StoredSnapshot> {
    const storedSnapshot: StoredSnapshot = {
      ...snapshot,
      id: crypto.randomUUID(),
      label: options?.label,
      tags: options?.tags
    }

    this.snapshots.push(storedSnapshot)
    
    if (this.snapshots.length > 50) {
      this.snapshots = this.snapshots.slice(-50)
    }

    await this.saveToStorage()
    return storedSnapshot
  }

  getSnapshots(): StoredSnapshot[] {
    return [...this.snapshots]
  }

  getSnapshot(id: string): StoredSnapshot | undefined {
    return this.snapshots.find(s => s.id === id)
  }

  async updateSnapshot(
    id: string,
    updates: {
      label?: string
      tags?: string[]
    }
  ): Promise<StoredSnapshot | undefined> {
    const index = this.snapshots.findIndex(s => s.id === id)
    if (index === -1) return undefined

    const updated: StoredSnapshot = {
      ...this.snapshots[index],
      ...updates
    }

    this.snapshots[index] = updated
    await this.saveToStorage()
    return updated
  }

  async deleteSnapshot(id: string): Promise<boolean> {
    const index = this.snapshots.findIndex(s => s.id === id)
    if (index === -1) return false

    this.snapshots.splice(index, 1)
    await this.saveToStorage()
    return true
  }

  async clearSnapshots(): Promise<void> {
    this.snapshots = []
    await this.saveToStorage()
  }

  searchSnapshots(query: SnapshotSearchQuery): StoredSnapshot[] {
    return this.snapshots.filter(snapshot => {
      if (query.label && 
          (!snapshot.label || 
           !snapshot.label.toLowerCase().includes(query.label.toLowerCase()))) {
        return false
      }

      if (query.tags?.length && 
          !query.tags.every(tag => snapshot.tags?.includes(tag))) {
        return false
      }

      if (query.dateRange) {
        const [start, end] = query.dateRange
        const snapshotDate = new Date(snapshot.timestamp)
        if (snapshotDate < start || snapshotDate > end) {
          return false
        }
      }

      if (query.performanceThreshold !== undefined) {
        if (snapshot.metrics.fps < query.performanceThreshold) {
          return false
        }
      }

      return true
    })
  }

  async exportSnapshots(ids?: string[]): Promise<string> {
    const toExport = ids
      ? this.snapshots.filter(s => ids.includes(s.id))
      : this.snapshots

    return JSON.stringify(toExport, null, 2)
  }

  async importSnapshots(data: string): Promise<StoredSnapshot[]> {
    try {
      const imported: StoredSnapshot[] = JSON.parse(data)
      
      if (!Array.isArray(imported) || 
          !imported.every(this.isValidSnapshot)) {
        throw new Error('Invalid snapshot data')
      }

      const merged = [...this.snapshots]
      
      for (const snapshot of imported) {
        const existingIndex = merged.findIndex(s => s.id === snapshot.id)
        if (existingIndex === -1) {
          merged.push(snapshot)
        } else {
          merged[existingIndex] = snapshot
        }
      }

      this.snapshots = merged.slice(-50)
      await this.saveToStorage()
      
      return this.snapshots
    } catch (error) {
      console.error('Failed to import snapshots:', error)
      throw new Error('Failed to import snapshots')
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('performance-snapshots')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.every(this.isValidSnapshot)) {
          this.snapshots = parsed
        }
      }
    } catch (error) {
      console.error('Failed to load snapshots:', error)
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      localStorage.setItem(
        'performance-snapshots',
        JSON.stringify(this.snapshots)
      )
    } catch (error) {
      console.error('Failed to save snapshots:', error)
    }
  }

  private isValidSnapshot(data: unknown): data is StoredSnapshot {
    return (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      'timestamp' in data &&
      'metrics' in data &&
      'history' in data &&
      'environment' in data
    )
  }
}