import { CheckCircle2, Play, BarChart3, X } from 'lucide-react'
import { useEvaluations, useRunEvaluation, useEvaluationResults } from '../hooks/api'
import { useState } from 'react'
import PerformanceChart from '../components/PerformanceChart'

export default function Evaluations() {
  const { data, isLoading, error } = useEvaluations()
  const runEvaluationMutation = useRunEvaluation()
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<number | null>(null)
  const { data: resultsData, isLoading: resultsLoading, error: resultsError } = useEvaluationResults(selectedEvaluationId || 0)

  const evaluations = data?.evaluations || []
  const summary = data?.summary || {
    totalEvaluations: 0,
    averageScore: 0,
    activeTests: 0
  }

  const handleRunEvaluation = async (evaluationId: number) => {
    try {
      await runEvaluationMutation.mutateAsync(evaluationId)
    } catch (error) {
      console.error('Failed to run evaluation:', error)
    }
  }

  const handleRunNewEvaluation = async () => {
    if (evaluations.length === 0) {
      alert('No evaluations available to run')
      return
    }

    // Find the most suitable evaluation to run:
    // 1. First try to find a pending evaluation
    // 2. Otherwise, run the first completed evaluation again
    // 3. As fallback, run the first available evaluation
    const pendingEval = evaluations.find(e => e.status === 'pending')
    const completedEval = evaluations.find(e => e.status === 'completed')
    const targetEval = pendingEval || completedEval || evaluations[0]

    if (targetEval) {
      try {
        console.log(`Running evaluation: ${targetEval.name}`)
        await handleRunEvaluation(targetEval.id)
      } catch (error) {
        console.error('Failed to run evaluation:', error)
        alert(`Failed to run evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleViewResults = (evaluationId: number) => {
    setSelectedEvaluationId(evaluationId)
  }

  const handleCloseResults = () => {
    setSelectedEvaluationId(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading evaluations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-600">Failed to load evaluations. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CheckCircle2 className="h-8 w-8 mr-3 text-green-500" />
            Model Evaluations
          </h1>
          <p className="mt-2 text-gray-600">
            Test and validate AI model performance
          </p>
        </div>
        <button 
          className="btn btn-primary btn-md"
          onClick={handleRunNewEvaluation}
          disabled={runEvaluationMutation.isPending}
        >
          <Play className="h-4 w-4 mr-2" />
          {runEvaluationMutation.isPending ? 'Running...' : 'Run New Evaluation'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Total Evaluations</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalEvaluations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{summary.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Active Tests</p>
              <p className="text-2xl font-bold text-gray-900">{summary.activeTests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Evaluations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Cases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {evaluation.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {evaluation.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(evaluation.status)}`}>
                      {evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluation.score ? `${evaluation.score}%` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluation.testCases}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {evaluation.lastRun}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-primary-600 hover:text-primary-900 mr-4"
                      onClick={() => handleViewResults(evaluation.id)}
                    >
                      View Results
                    </button>
                    <button 
                      className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      onClick={() => handleRunEvaluation(evaluation.id)}
                      disabled={runEvaluationMutation.isPending}
                    >
                      {runEvaluationMutation.isPending ? 'Running...' : 'Run Again'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Chart */}
      <PerformanceChart />

      {/* Evaluation Results Modal */}
      {selectedEvaluationId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Evaluation Results
                </h3>
                <button
                  onClick={handleCloseResults}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              {resultsLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-gray-600">Loading results...</span>
                </div>
              )}

              {resultsError && (
                <div className="text-center py-8 text-red-600">
                  Failed to load evaluation results. Please try again.
                </div>
              )}

              {resultsData && !resultsLoading && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{resultsData.name}</h4>
                    <p className="text-gray-600 mb-4">{resultsData.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(resultsData.status)}`}>
                          {resultsData.status.charAt(0).toUpperCase() + resultsData.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Score:</span>
                        <span className="ml-2 text-sm text-gray-900">{resultsData.score ? `${resultsData.score}%` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  {resultsData.summary && (
                    <div>
                      <h5 className="text-md font-medium text-gray-900 mb-3">Test Summary</h5>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{resultsData.summary.totalTests}</div>
                          <div className="text-sm text-gray-500">Total Tests</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{resultsData.summary.passed || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Passed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{resultsData.summary.failed || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{resultsData.summary.accuracy || 'N/A'}%</div>
                          <div className="text-sm text-gray-500">Accuracy</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Test Results Breakdown */}
                  {resultsData.testResults && (
                    <div>
                      <h5 className="text-md font-medium text-gray-900 mb-3">Results Breakdown</h5>
                      <div className="space-y-2">
                        {resultsData.testResults.map((result: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-sm font-medium text-gray-700">{result.category}</span>
                            <div className="text-right">
                              <span className="text-sm font-medium text-gray-900">{result.count}</span>
                              <span className="text-sm text-gray-500 ml-1">({result.percentage}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance Metrics */}
                  {resultsData.metrics && (
                    <div>
                      <h5 className="text-md font-medium text-gray-900 mb-3">Performance Metrics</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between p-3 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700">Precision</span>
                          <span className="text-sm font-medium text-gray-900">{resultsData.metrics.precision}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700">Recall</span>
                          <span className="text-sm font-medium text-gray-900">{resultsData.metrics.recall}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700">F1 Score</span>
                          <span className="text-sm font-medium text-gray-900">{resultsData.metrics.f1Score}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700">AUC</span>
                          <span className="text-sm font-medium text-gray-900">{resultsData.metrics.auc}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {resultsData.executionTime && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Execution Time: <span className="font-medium text-gray-900">{resultsData.executionTime}</span>
                      </div>
                      {resultsData.lastRun && (
                        <div className="text-sm text-gray-500 mt-1">
                          Last Run: <span className="font-medium text-gray-900">{resultsData.lastRun}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Errors/Warnings */}
                  {resultsData.errors && resultsData.errors.length > 0 && (
                    <div>
                      <h5 className="text-md font-medium text-gray-900 mb-3">Warnings & Issues</h5>
                      <div className="space-y-2">
                        {resultsData.errors.map((error: string, index: number) => (
                          <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <span className="text-sm text-yellow-800">{error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}