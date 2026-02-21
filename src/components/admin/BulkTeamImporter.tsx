"use client"

import { useState, useTransition } from "react"
import { importTeams } from "@/app/actions/tournament"
import { Loader2, CheckCircle, AlertCircle, Eye, FileText } from "lucide-react"

export function BulkTeamImporter({ tournamentId }: { tournamentId: string }) {
    const [csvData, setCsvData] = useState("")
    const [previewData, setPreviewData] = useState<any[]>([])
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isPending, startTransition] = useTransition()

    const SAMPLE_CSV = `Gonzaga, 1, West\nArizona, 2, West\nDuke, 3, West\n...\nKentucky, 1, South`

    const LLM_PROMPT = `Please generate a CSV list of all 64 NCAA tournament teams for the 2026 bracket. 
Format: Name, Seed, Region. 
Regions must be exactly: East, West, South, Midwest. 
Seeds must be integers 1-16. 
Do not include a header row. 
Example line: "Team Name, 1, East"`

    const handlePreview = () => {
        setError("")
        setSuccess("")
        if (!csvData.trim()) {
            setError("Please paste some CSV data first.")
            return
        }

        const lines = csvData.trim().split("\n")
        const parsed = []

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            const parts = line.split(",").map(p => p.trim())
            if (parts.length !== 3) {
                setError(`Line ${i + 1} format invalid. Expected 3 comma-separated values.`)
                return
            }
            parsed.push({ name: parts[0], seed: parts[1], region: parts[2] })
        }
        setPreviewData(parsed)
    }

    const handleImport = () => {
        startTransition(async () => {
            const result = await importTeams(tournamentId, csvData)
            if (result.success) {
                setSuccess(result.message as string)
                setError("")
                setPreviewData([]) // Clear preview on success? Or keep it?
            } else {
                setError(result.message as string)
                setSuccess("")
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    Importer Instructions
                </h4>
                <p>Paste your CSV data below. Format: <strong>Name, Seed, Region</strong>. <br />Regions: East, West, South, Midwest.</p>
                <div className="mt-3">
                    <p className="font-semibold text-xs uppercase tracking-wider text-blue-600 mb-1">Copy this prompt for Gemini/ChatGPT:</p>
                    <code className="block bg-white p-2 rounded border border-blue-200 text-xs overflow-x-auto select-all cursor-text text-gray-600">
                        {LLM_PROMPT}
                    </code>
                </div>
            </div>

            <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder={SAMPLE_CSV}
                className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />

            <div className="flex gap-4">
                <button
                    onClick={handlePreview}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    <Eye className="w-5 h-5" />
                    Preview
                </button>
                <button
                    onClick={handleImport}
                    disabled={isPending || previewData.length === 0}
                    className="flex-1 bg-brand-orange text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    Confirm Import
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    {success}
                </div>
            )}

            {previewData.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden mt-8">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-bold text-gray-700">
                        Preview ({previewData.length} Teams)
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white sticky top-0 shadow-sm">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-gray-600">Seed</th>
                                    <th className="px-6 py-3 font-semibold text-gray-600">Region</th>
                                    <th className="px-6 py-3 font-semibold text-gray-600">Team Name</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {previewData.map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-2 text-gray-900 font-mono">{row.seed}</td>
                                        <td className="px-6 py-2 text-gray-600">{row.region}</td>
                                        <td className="px-6 py-2 font-medium text-gray-900">{row.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
