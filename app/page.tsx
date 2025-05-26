"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Target,
  BookOpen,
  Lightbulb,
  Filter,
  BarChart3,
} from "lucide-react"
import { MatrixDisplay } from "@/components/matrix-display"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  allMatrixQuestions,
  getQuestionsByDifficulty,
  getRandomQuestion,
  type MatrixQuestion,
} from "@/data/matrix-questions"

interface MatrixAnalysis {
  isValid: boolean
  errors: string[]
  errorRows: number[]
  errorCells: { row: number; col: number }[]
  pivotCells: { row: number; col: number }[]
}

const checkRowEchelonForm = (matrix: number[][]): MatrixAnalysis => {
  const errors: string[] = []
  const errorRows: number[] = []
  const errorCells: { row: number; col: number }[] = []
  const pivotCells: { row: number; col: number }[] = []

  const rows = matrix.length
  const cols = matrix[0].length

  let lastPivotCol = -1
  let hasNonZeroRow = false

  for (let i = 0; i < rows; i++) {
    // Check if row is all zeros
    const isZeroRow = matrix[i].every((val) => val === 0)

    if (isZeroRow) {
      if (hasNonZeroRow) {
        errors.push(`Hàng ${i + 1}: Hàng toàn số 0 không được nằm trên hàng khác 0`)
        errorRows.push(i)
      }
      continue
    }

    hasNonZeroRow = true

    // Find pivot (first non-zero entry)
    let pivotCol = -1
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j] !== 0) {
        pivotCol = j
        pivotCells.push({ row: i, col: j })
        break
      }
    }

    if (pivotCol === -1) continue

    // Check if pivot is to the right of previous pivot
    if (pivotCol <= lastPivotCol) {
      errors.push(
        `Hàng ${i + 1}: Pivot ở cột ${pivotCol + 1} phải nằm bên phải pivot của hàng trước (cột ${lastPivotCol + 1})`,
      )
      errorCells.push({ row: i, col: pivotCol })
    }

    // Check if all entries below pivot are zero
    for (let k = i + 1; k < rows; k++) {
      if (matrix[k][pivotCol] !== 0) {
        errors.push(`Hàng ${k + 1}: Phần tử ở cột ${pivotCol + 1} phải bằng 0 (dưới pivot)`)
        errorCells.push({ row: k, col: pivotCol })
      }
    }

    lastPivotCol = pivotCol
  }

  return {
    isValid: errors.length === 0,
    errors,
    errorRows,
    errorCells,
    pivotCells,
  }
}

export default function MatrixQuizApp() {
  const [currentQuestion, setCurrentQuestion] = useState<MatrixQuestion | null>(null)
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [explanation, setExplanation] = useState<MatrixAnalysis>({
    isValid: true,
    errors: [],
    errorRows: [],
    errorCells: [],
    pivotCells: [],
  })
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all")
  const [questionHistory, setQuestionHistory] = useState<{ id: number; correct: boolean }[]>([])

  const generateNewQuestion = () => {
    setIsAnimating(true)
    setShowResult(false)
    setUserAnswer(null)

    setTimeout(() => {
      let newQuestion: MatrixQuestion

      if (selectedDifficulty === "all") {
        newQuestion = getRandomQuestion()
      } else {
        const questionsOfDifficulty = getQuestionsByDifficulty(selectedDifficulty)
        const randomIndex = Math.floor(Math.random() * questionsOfDifficulty.length)
        newQuestion = questionsOfDifficulty[randomIndex]
      }

      setCurrentQuestion(newQuestion)
      setIsAnimating(false)
    }, 300)
  }

  const handleAnswer = (answer: boolean) => {
    if (!currentQuestion) return

    setUserAnswer(answer)
    const result = checkRowEchelonForm(currentQuestion.matrix)
    setExplanation(result)
    setShowResult(true)

    const isCorrect = answer === currentQuestion.isRowEchelon
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))

    // Add to history
    setQuestionHistory((prev) => [...prev, { id: currentQuestion.id, correct: isCorrect }])
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  useEffect(() => {
    generateNewQuestion()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              Quiz Ma Trận Bậc Thang
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Kho 200 câu hỏi được thiết kế chuyên nghiệp</p>

          {/* Stats */}
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <Badge variant="outline" className="text-lg px-4 py-2 bg-white/50 dark:bg-gray-800/50">
              <Target className="h-4 w-4 mr-2" />
              Điểm: {score.correct}/{score.total}
            </Badge>
            {score.total > 0 && (
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-white/50 dark:bg-gray-800/50">
                <BarChart3 className="h-4 w-4 mr-2" />
                Tỷ lệ đúng: {Math.round((score.correct / score.total) * 100)}%
              </Badge>
            )}
            <Badge variant="outline" className="text-lg px-4 py-2 bg-white/50 dark:bg-gray-800/50">
              Tổng: {allMatrixQuestions.length} câu
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Quiz */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur transition-colors duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Câu hỏi
                {currentQuestion && (
                  <Badge className={`ml-2 ${getDifficultyColor(currentQuestion.difficulty)}`}>
                    {currentQuestion.difficulty.toUpperCase()}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Difficulty Filter */}
              <div className="flex items-center gap-4">
                <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <Select value={selectedDifficulty} onValueChange={(value: any) => setSelectedDifficulty(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Chọn độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="easy">Dễ (1-60)</SelectItem>
                    <SelectItem value="medium">Trung bình (61-120)</SelectItem>
                    <SelectItem value="hard">Khó (121-200)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateNewQuestion}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-300"
                disabled={isAnimating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isAnimating ? "animate-spin" : ""}`} />
                Câu hỏi mới
              </Button>

              {/* Question Info */}
              {currentQuestion && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">
                      <strong>ID:</strong> #{currentQuestion.id}
                    </span>
                    <span className="text-blue-700 dark:text-blue-300">
                      <strong>Loại:</strong> {currentQuestion.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Matrix Display */}
              {currentQuestion && (
                <div
                  className={`transition-all duration-500 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                >
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center border-2 border-dashed border-gray-200 dark:border-gray-600 transition-colors duration-300">
                    <p className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
                      Ma trận này có phải là ma trận bậc thang không?
                    </p>
                    <MatrixDisplay
                      matrix={currentQuestion.matrix}
                      highlightErrors={
                        showResult
                          ? {
                              errorRows: explanation.errorRows,
                              errorCells: explanation.errorCells,
                              pivotCells: explanation.pivotCells,
                            }
                          : undefined
                      }
                    />
                  </div>
                </div>
              )}

              {/* Answer Buttons */}
              {currentQuestion && !showResult && (
                <div className="grid grid-cols-2 gap-4 animate-slide-up">
                  <Button
                    onClick={() => handleAnswer(true)}
                    className="h-16 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                    disabled={userAnswer !== null}
                  >
                    <CheckCircle className="h-6 w-6 mr-2" />
                    Đúng
                  </Button>
                  <Button
                    onClick={() => handleAnswer(false)}
                    className="h-16 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                    disabled={userAnswer !== null}
                  >
                    <XCircle className="h-6 w-6 mr-2" />
                    Sai
                  </Button>
                </div>
              )}

              {/* Result */}
              {showResult && currentQuestion && (
                <div
                  className={`animate-bounce-in p-4 rounded-lg transition-colors duration-300 ${
                    userAnswer === currentQuestion.isRowEchelon
                      ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600"
                      : "bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-600"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {userAnswer === currentQuestion.isRowEchelon ? (
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    )}
                    <span className="font-bold text-lg text-gray-800 dark:text-white">
                      {userAnswer === currentQuestion.isRowEchelon ? "Chính xác!" : "Sai rồi!"}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Ma trận này {currentQuestion.isRowEchelon ? "là" : "không phải là"} ma trận bậc thang.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <strong>Giải thích:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Explanation */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur transition-colors duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Phân tích chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showResult ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Chọn đáp án để xem phân tích chi tiết</p>
                </div>
              ) : (
                <div className="space-y-4 animate-slide-up">
                  {/* Legend */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Chú thích màu sắc:
                    </h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-500 rounded"></div>
                        <span className="text-blue-700 dark:text-blue-300">Pivot (phần tử đầu tiên khác 0)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-500 rounded"></div>
                        <span className="text-red-700 dark:text-red-300">Lỗi vi phạm điều kiện</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-600 rounded"></div>
                        <span className="text-orange-700 dark:text-orange-300">Hàng có vấn đề</span>
                      </div>
                    </div>
                  </div>

                  {/* Rules */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                      Điều kiện ma trận bậc thang:
                    </h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Tất cả hàng toàn số 0 phải ở dưới cùng</li>
                      <li>• Pivot (phần tử khác 0 đầu tiên) của mỗi hàng phải ở bên phải pivot hàng trên</li>
                      <li>• Tất cả phần tử dưới pivot phải bằng 0</li>
                    </ul>
                  </div>

                  {/* Analysis */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Phân tích ma trận:</h3>
                    {currentQuestion?.isRowEchelon ? (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Ma trận thỏa mãn tất cả điều kiện bậc thang</span>
                        </div>
                        {explanation.pivotCells.length > 0 && (
                          <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                            <p>Các pivot được đánh dấu màu xanh dương trong ma trận.</p>
                            <p className="mt-1">
                              <strong>Vị trí pivot:</strong>{" "}
                              {explanation.pivotCells.map((p) => `(${p.row + 1},${p.col + 1})`).join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                          <div className="flex items-center gap-2 text-red-800 dark:text-red-300 mb-2">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">Các lỗi được phát hiện:</span>
                          </div>
                          <ul className="space-y-2">
                            {explanation.errors.map((error, index) => (
                              <li key={index} className="text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                {error}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 text-sm text-red-700 dark:text-red-300">
                            <p>Các ô có lỗi được đánh dấu màu đỏ trong ma trận.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Question Info */}
                  {currentQuestion && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Thông tin câu hỏi:</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <p>
                          <strong>ID:</strong> #{currentQuestion.id}
                        </p>
                        <p>
                          <strong>Độ khó:</strong> {currentQuestion.difficulty}
                        </p>
                        <p>
                          <strong>Danh mục:</strong> {currentQuestion.category}
                        </p>
                        <p>
                          <strong>Kích thước:</strong> {currentQuestion.matrix.length}×
                          {currentQuestion.matrix[0].length}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Next Question Button */}
                  <Button
                    onClick={generateNewQuestion}
                    className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Câu hỏi tiếp theo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics Panel */}
        {questionHistory.length > 0 && (
          <Card className="mt-8 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Thống kê luyện tập
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score.total}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Tổng câu</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{score.correct}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Đúng</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{score.total - score.correct}</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Sai</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Tỷ lệ đúng</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes matrix-appear {
          from { 
            opacity: 0; 
            transform: scale(0.8) rotateY(10deg); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) rotateY(0deg); 
          }
        }

        @keyframes cell-appear {
          from { 
            opacity: 0; 
            transform: translateY(10px) scale(0.8); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        .animate-matrix-appear {
          animation: matrix-appear 0.8s ease-out;
        }

        .animate-cell-appear {
          animation: cell-appear 0.6s ease-out both;
        }
      `}</style>
    </div>
  )
}
