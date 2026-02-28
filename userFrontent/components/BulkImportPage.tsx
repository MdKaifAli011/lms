'use client'

import { useState } from 'react'
import { Button } from '@payloadcms/ui'

interface ImportResults {
  created: {
    exams: number
    subjects: number
    units: number
    chapters: number
    topics: number
    subtopics: number
    definitions: number
  }
  skipped: {
    exams: number
    subjects: number
    units: number
    chapters: number
    topics: number
    subtopics: number
    definitions: number
  }
  errors: string[]
}

export default function BulkImportPage() {
  const [csvData, setCsvData] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [results, setResults] = useState<ImportResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setCsvData(text)
      setError(null)
      setResults(null)
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!csvData.trim()) {
      setError('Please upload a CSV file or paste CSV data')
      return
    }

    setIsImporting(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvData }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Import failed')
      }

      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data')
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = `exam,subject,unit,chapter,topic,subtopic,definition
NEET,Physics,Mechanics,Kinematics,Motion,Velocity,Speed
NEET,Physics,Mechanics,Kinematics,Motion,Acceleration,Force
NEET,Physics,Mechanics,Kinematics,,,
JEE,Physics,Mechanics,Kinematics,Motion,Velocity,Speed
JEE,Chemistry,Organic Chemistry,Alkanes,Hydrocarbons,Methane,Definition
JEE,Chemistry,Organic Chemistry,Alkanes,,,
JEE,Math,Algebra,Equations,Linear,,`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
        Bulk Import Data
      </h1>
      <p style={{ color: 'var(--theme-text-50)', marginBottom: '24px' }}>
        Import exams, subjects, units, chapters, topics, subtopics, and definitions from CSV file
      </p>

      {/* CSV Format Info */}
      <div
        style={{
          background: 'var(--theme-elevation-100)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
          CSV Format
        </h2>
        <p style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--theme-text)' }}>
          Your CSV file must have the following columns (in order):
        </p>
        <p style={{ fontSize: '13px', marginBottom: '12px', color: 'var(--theme-text-50)', fontStyle: 'italic' }}>
          💡 <strong>Note:</strong> You can leave cells empty if a level doesn&apos;t exist. For example, if a chapter has no topics, leave topic/subtopic/definition columns empty.
        </p>
        <code
          style={{
            display: 'block',
            padding: '12px',
            background: 'var(--theme-elevation-200)',
            borderRadius: '4px',
            fontSize: '13px',
            fontFamily: 'monospace',
            marginBottom: '12px',
          }}
        >
          exam,subject,unit,chapter,topic,subtopic,definition
        </code>
        <Button onClick={downloadTemplate} buttonStyle="secondary" size="small">
          Download Template CSV
        </Button>
      </div>

      {/* File Upload */}
      <div style={{ marginBottom: '24px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '8px',
          }}
        >
          Upload CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{
            padding: '8px',
            border: '1px solid var(--theme-border-color)',
            borderRadius: '4px',
            width: '100%',
            fontSize: '14px',
          }}
        />
      </div>

      {/* CSV Data Input */}
      <div style={{ marginBottom: '24px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '8px',
          }}
        >
          Or Paste CSV Data
        </label>
        <textarea
          value={csvData}
          onChange={(e) => {
            setCsvData(e.target.value)
            setError(null)
            setResults(null)
          }}
          placeholder="exam,subject,unit,chapter,topic,subtopic,definition&#10;NEET,Physics,Mechanics,Kinematics,Motion,Velocity,Speed&#10;NEET,Physics,Mechanics,Kinematics,,,&#10;JEE,Math,Algebra,Equations,Linear,,"
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '12px',
            border: '1px solid var(--theme-border-color)',
            borderRadius: '4px',
            fontSize: '13px',
            fontFamily: 'monospace',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Import Button */}
      <div style={{ marginBottom: '24px' }}>
        <Button
          onClick={handleImport}
          disabled={isImporting || !csvData.trim()}
          size="large"
        >
          {isImporting ? 'Importing...' : 'Import Data'}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: '16px',
            background: 'var(--theme-error-100)',
            border: '1px solid var(--theme-error-500)',
            borderRadius: '8px',
            marginBottom: '24px',
            color: 'var(--theme-error-900)',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div
          style={{
            padding: '24px',
            background: 'var(--theme-elevation-100)',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
            Import Results
          </h2>

          {/* Created */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'green' }}>
              ✅ Created
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '14px' }}>
              <div>Exams: {results.created.exams}</div>
              <div>Subjects: {results.created.subjects}</div>
              <div>Units: {results.created.units}</div>
              <div>Chapters: {results.created.chapters}</div>
              <div>Topics: {results.created.topics}</div>
              <div>Subtopics: {results.created.subtopics}</div>
              <div>Definitions: {results.created.definitions}</div>
            </div>
          </div>

          {/* Skipped */}
          {(results.skipped.exams > 0 ||
            results.skipped.subjects > 0 ||
            results.skipped.units > 0 ||
            results.skipped.chapters > 0 ||
            results.skipped.topics > 0 ||
            results.skipped.subtopics > 0 ||
            results.skipped.definitions > 0) && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'orange' }}>
                ⏭️ Skipped (Already Exists)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '14px' }}>
                <div>Exams: {results.skipped.exams}</div>
                <div>Subjects: {results.skipped.subjects}</div>
                <div>Units: {results.skipped.units}</div>
                <div>Chapters: {results.skipped.chapters}</div>
                <div>Topics: {results.skipped.topics}</div>
                <div>Subtopics: {results.skipped.subtopics}</div>
                <div>Definitions: {results.skipped.definitions}</div>
              </div>
            </div>
          )}

          {/* Errors */}
          {results.errors.length > 0 && (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'red' }}>
                ❌ Errors
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                {results.errors.map((err, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
