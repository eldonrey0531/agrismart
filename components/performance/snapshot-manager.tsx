import { useState, useEffect } from 'react'
import { SnapshotStorage } from '@/lib/utils/snapshot-storage'
import { ExportButton } from './export-button'
import type { StoredSnapshot } from '@/lib/utils/snapshot-storage'

interface SnapshotManagerProps {
  onSelect?: (snapshots: StoredSnapshot[]) => void
  maxSelect?: number
  className?: string
}

/**
 * Performance snapshot management UI
 */
export function SnapshotManager({
  onSelect,
  maxSelect = 2,
  className = ''
}: SnapshotManagerProps) {
  const [snapshots, setSnapshots] = useState<StoredSnapshot[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editTags, setEditTags] = useState('')
  
  const storage = SnapshotStorage.getInstance()

  // Load snapshots
  useEffect(() => {
    const loadedSnapshots = storage.getSnapshots()
    setSnapshots(loadedSnapshots)
  }, [])

  // Filter snapshots
  const filteredSnapshots = snapshots.filter(snapshot => {
    // Text search
    if (searchTerm && !(
      snapshot.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snapshot.tags?.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )) {
      return false
    }

    // Tag filter
    if (selectedTags.length && !selectedTags.every(tag => 
      snapshot.tags?.includes(tag)
    )) {
      return false
    }

    // Date range
    if (dateRange) {
      const [start, end] = dateRange
      const date = new Date(snapshot.timestamp)
      if (date < start || date > end) {
        return false
      }
    }

    return true
  })

  // Get unique tags
  const allTags = [...new Set(
    snapshots.flatMap(s => s.tags || [])
  )].sort()

  // Handle snapshot selection
  const handleSelect = (id: string) => {
    setSelected(prev => {
      const newSelected = prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id].slice(-maxSelect)
      
      const selectedSnapshots = snapshots.filter(s => 
        newSelected.includes(s.id)
      )
      onSelect?.(selectedSnapshots)
      
      return newSelected
    })
  }

  // Handle snapshot edit
  const handleEdit = async (id: string) => {
    if (!editLabel.trim()) return

    const updated = await storage.updateSnapshot(id, {
      label: editLabel.trim(),
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean)
    })

    if (updated) {
      setSnapshots(prev => prev.map(s => 
        s.id === id ? updated : s
      ))
    }

    setEditingId(null)
    setEditLabel('')
    setEditTags('')
  }

  // Handle snapshot delete
  const handleDelete = async (id: string) => {
    if (await storage.deleteSnapshot(id)) {
      setSnapshots(prev => prev.filter(s => s.id !== id))
      setSelected(prev => prev.filter(s => s !== id))
    }
  }

  // Handle file import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const imported = await storage.importSnapshots(text)
      setSnapshots(imported)
    } catch (error) {
      console.error('Import failed:', error)
      // You might want to show a toast/notification here
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search snapshots..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 rounded border"
          />
          
          <select
            multiple
            value={selectedTags}
            onChange={e => setSelectedTags(
              Array.from(e.target.selectedOptions, opt => opt.value)
            )}
            className="px-3 py-1.5 rounded border"
          >
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="snapshot-import"
          />
          <label
            htmlFor="snapshot-import"
            className="px-3 py-1.5 bg-blue-500 text-white rounded cursor-pointer"
          >
            Import
          </label>

          <ExportButton
            onClick={() => storage.exportSnapshots(selected)}
            disabled={!selected.length}
          />
        </div>
      </div>

      {/* Snapshot List */}
      <div className="space-y-4">
        {filteredSnapshots.map(snapshot => (
          <div
            key={snapshot.id}
            className={`
              p-4 rounded-lg border
              ${selected.includes(snapshot.id) ? 'border-blue-500 bg-blue-50' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              {/* Snapshot Info */}
              <div className="flex-1">
                {editingId === snapshot.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      placeholder="Snapshot label"
                      className="w-full px-2 py-1 border rounded"
                    />
                    <input
                      type="text"
                      value={editTags}
                      onChange={e => setEditTags(e.target.value)}
                      placeholder="Tags (comma-separated)"
                      className="w-full px-2 py-1 border rounded"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(snapshot.id)}
                        className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium">
                      {snapshot.label || 'Unnamed Snapshot'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(snapshot.timestamp).toLocaleString()}
                    </div>
                    {snapshot.tags?.length ? (
                      <div className="flex gap-2 mt-2">
                        {snapshot.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSelect(snapshot.id)}
                  className={`
                    p-2 rounded-full
                    ${selected.includes(snapshot.id)
                      ? 'text-blue-500'
                      : 'text-gray-400 hover:text-gray-600'
                    }
                  `}
                >
                  <CheckIcon />
                </button>
                <button
                  onClick={() => {
                    setEditingId(snapshot.id)
                    setEditLabel(snapshot.label || '')
                    setEditTags(snapshot.tags?.join(', ') || '')
                  }}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => handleDelete(snapshot.id)}
                  className="p-2 rounded-full text-gray-400 hover:text-red-600"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Icons
function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}