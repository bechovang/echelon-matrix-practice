"use client"

import { useState, useEffect } from "react"

interface MatrixDisplayProps {
  matrix: number[][]
  highlightErrors?: {
    errorRows?: number[]
    errorCells?: { row: number; col: number }[]
    pivotCells?: { row: number; col: number }[]
  }
  className?: string
}

export function MatrixDisplay({ matrix, highlightErrors, className = "" }: MatrixDisplayProps) {
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    setAnimationKey((prev) => prev + 1)
  }, [matrix])

  if (!matrix || matrix.length === 0) return null

  const rows = matrix.length
  const cols = matrix[0].length

  const isErrorRow = (rowIndex: number) => highlightErrors?.errorRows?.includes(rowIndex) || false

  const isErrorCell = (rowIndex: number, colIndex: number) =>
    highlightErrors?.errorCells?.some((cell) => cell.row === rowIndex && cell.col === colIndex) || false

  const isPivotCell = (rowIndex: number, colIndex: number) =>
    highlightErrors?.pivotCells?.some((cell) => cell.row === rowIndex && cell.col === colIndex) || false

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div key={animationKey} className="relative animate-matrix-appear">
        {/* Left bracket */}
        <div className="absolute left-0 top-0 h-full w-3 flex flex-col">
          <div className="h-2 w-full border-l-2 border-t-2 border-foreground dark:border-white rounded-tl-md"></div>
          <div className="flex-1 w-full border-l-2 border-foreground dark:border-white"></div>
          <div className="h-2 w-full border-l-2 border-b-2 border-foreground dark:border-white rounded-bl-md"></div>
        </div>

        {/* Right bracket */}
        <div className="absolute right-0 top-0 h-full w-3 flex flex-col">
          <div className="h-2 w-full border-r-2 border-t-2 border-foreground dark:border-white rounded-tr-md"></div>
          <div className="flex-1 w-full border-r-2 border-foreground dark:border-white"></div>
          <div className="h-2 w-full border-r-2 border-b-2 border-foreground dark:border-white rounded-br-md"></div>
        </div>

        {/* Matrix content */}
        <div className="px-6 py-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {matrix.map((row, rowIndex) =>
              row.map((value, colIndex) => {
                const cellKey = `${rowIndex}-${colIndex}`
                const isError = isErrorCell(rowIndex, colIndex)
                const isPivot = isPivotCell(rowIndex, colIndex)
                const isRowError = isErrorRow(rowIndex)

                return (
                  <div
                    key={cellKey}
                    className={`
                      relative min-w-[3rem] h-12 flex items-center justify-center
                      text-lg font-medium rounded-lg transition-all duration-300
                      ${
                        isError
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 ring-2 ring-red-400 dark:ring-red-500"
                          : isPivot
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 ring-2 ring-blue-400 dark:ring-blue-500"
                            : isRowError
                              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 ring-1 ring-orange-300 dark:ring-orange-600"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }
                      animate-cell-appear
                    `}
                    style={{ animationDelay: `${(rowIndex * cols + colIndex) * 50}ms` }}
                  >
                    {value}

                    {/* Error indicator */}
                    {isError && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}

                    {/* Pivot indicator */}
                    {isPivot && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                )
              }),
            )}
          </div>
        </div>

        {/* Matrix size indicator */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border">
            {rows} × {cols}
          </div>
        </div>
      </div>
    </div>
  )
}
