"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function GlobalFilter({ groups }: { groups: { id: string, name: string }[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentFilter = searchParams.get('filterGroupId') || ""

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        const params = new URLSearchParams(searchParams.toString())
        if (val) {
            params.set('filterGroupId', val)
        } else {
            params.delete('filterGroupId')
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <select
            value={currentFilter}
            onChange={handleChange}
            className="text-xs border-none bg-transparent text-white/90 font-medium focus:ring-0 cursor-pointer p-0 pr-8"
        >
            <option value="" className="text-gray-900">All Groups</option>
            {groups.map(g => (
                <option key={g.id} value={g.id} className="text-gray-900">{g.name}</option>
            ))}
        </select>
    )
}
