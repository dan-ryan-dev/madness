import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function TestDBPage() {
    let status = "Starting..."
    let errorInfo = null

    try {
        status = "Prisma import successful. Attempting query..."
        const count = await prisma.tournament.count()
        status = `Success! Found ${count} tournaments.`
    } catch (e: any) {
        status = "Failed at query stage."
        errorInfo = {
            message: e.message,
            code: e.code,
            stack: e.stack
        }
    }

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">DB Connectivity Test</h1>
            <div className="p-4 bg-gray-100 rounded">
                <p><strong>Status:</strong> {status}</p>
            </div>
            {errorInfo && (
                <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
                    <p className="font-bold">Error Details:</p>
                    <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(errorInfo, null, 2)}</pre>
                </div>
            )}
        </div>
    )
}
