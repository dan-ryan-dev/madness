"use client"

import { useState, useActionState } from "react"
import { Plus, Edit2, Trash2, Trophy, Loader2, X, AlertTriangle } from "lucide-react"
import { createHallOfFameEntry, updateHallOfFameEntry, deleteHallOfFameEntry } from "@/app/actions/hall-of-fame"

interface Entry {
    id: string
    year: number
    winnerName: string
    winningTeam: string
    totalPoints: number
    groupName: string | null
}

export function HallOfFameAdminManager({ initialEntries }: { initialEntries: Entry[] }) {
    const [entries, setEntries] = useState(initialEntries)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

    // Form Action Setup
    const [state, action, isPending] = useActionState(
        editingEntry ? updateHallOfFameEntry : createHallOfFameEntry,
        null
    )

    const handleEdit = (entry: Entry) => {
        setEditingEntry(entry)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this champion from history?")) return
        const result = await deleteHallOfFameEntry(id)
        if (result.success) {
            setEntries(entries.filter(e => e.id !== id))
        } else {
            alert(result.message)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingEntry(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-orange/10 rounded-xl text-brand-orange">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tight">Hall of Fame Records</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Historical Champions & Stats</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add New Champion
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 w-24">Year</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Champion</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Winning Team</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Points</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Group</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {initialEntries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="font-mono font-black text-brand-blue text-lg">{entry.year}</span>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">{entry.winnerName}</td>
                                <td className="px-6 py-4 font-bold text-brand-orange">{entry.winningTeam}</td>
                                <td className="px-6 py-4 font-black">{entry.totalPoints}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 italic">{entry.groupName || "-"}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(entry)}
                                            className="p-2 text-gray-400 hover:text-brand-blue transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {initialEntries.length === 0 && (
                    <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">
                        No historical records found.
                    </div>
                )}
            </div>

            {/* Entry Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <form
                        action={action}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200"
                    >
                        <div className="bg-brand-blue p-6 text-white flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase italic tracking-tight">
                                {editingEntry ? "Edit Champion" : "Add New Champion"}
                            </h2>
                            <button type="button" onClick={closeModal} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-4">
                            {editingEntry && <input type="hidden" name="id" value={editingEntry.id} />}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Year</label>
                                    <input
                                        type="number"
                                        name="year"
                                        defaultValue={editingEntry?.year}
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-brand-blue focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Points</label>
                                    <input
                                        type="number"
                                        name="totalPoints"
                                        defaultValue={editingEntry?.totalPoints}
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-brand-blue focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Champion Name</label>
                                <input
                                    type="text"
                                    name="winnerName"
                                    defaultValue={editingEntry?.winnerName}
                                    required
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-brand-blue focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Winning Team</label>
                                <input
                                    type="text"
                                    name="winningTeam"
                                    defaultValue={editingEntry?.winningTeam}
                                    required
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-brand-blue focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Group Name (Optional)</label>
                                <input
                                    type="text"
                                    name="groupName"
                                    defaultValue={editingEntry?.groupName || ""}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-brand-blue focus:bg-white outline-none transition-all"
                                />
                            </div>

                            {state?.message && (
                                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${state.success ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                    {!state.success && <AlertTriangle className="w-4 h-4" />}
                                    {state.message}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-100 transition-all border-2 border-transparent"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-[2] bg-brand-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingEntry ? "Update Champion" : "Add Champion")}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
