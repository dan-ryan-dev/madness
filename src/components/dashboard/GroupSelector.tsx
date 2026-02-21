"use client"

import { useRouter } from "next/navigation"
import { ChevronDown, Trophy } from "lucide-react"

interface GroupSelectorProps {
    groups: { id: string; name: string }[]
    currentGroupId: string
}

export function GroupSelector({ groups, currentGroupId }: GroupSelectorProps) {
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.push(`/groups/${e.target.value}/dashboard`)
    }

    return (
        <div className="relative flex items-center gap-2 group">
            <Trophy className="w-6 h-6 text-brand-orange" />
            <div className="relative">
                <select
                    value={currentGroupId}
                    onChange={handleChange}
                    className="appearance-none bg-transparent font-black text-2xl text-gray-900 border-none focus:ring-0 cursor-pointer pr-8 py-0 pl-0 hover:text-brand-blue transition-colors truncate max-w-[200px] sm:max-w-none"
                    aria-label="Switch Group"
                >
                    {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-hover:text-brand-blue" />
            </div>
        </div>
    )
}
