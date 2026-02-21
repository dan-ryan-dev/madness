"use client"

import { updateGroup } from "@/app/actions/group"
import { useActionState } from "react"
import { Plus, Save } from "lucide-react"

const initialState = {
    success: false,
    message: "",
}

export function EditGroupForm({ group }: { group: any }) {
    const [state, formAction, isPending] = useActionState(updateGroup, initialState)

    return (
        <form action={formAction} className="space-y-8">
            <input type="hidden" name="groupId" value={group.id} />

            {/* Group Name */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Group Settings</h2>
                <div className="max-w-md">
                    <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                        Group Name
                    </label>
                    <input
                        type="text"
                        name="groupName"
                        id="groupName"
                        defaultValue={group.name}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    />
                </div>
            </div>

            {/* Invite New Users (Only if < 8 members) */}
            {group.memberships.length < 8 ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-brand-blue" />
                        Invite New Members
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        This group has {group.memberships.length}/8 members. You can invite {8 - group.memberships.length} more.
                    </p>

                    <div className="space-y-3">
                        {Array.from({ length: 8 - group.memberships.length }).map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <input
                                    type="text"
                                    name={`new_player_${i}_name`}
                                    placeholder="Name"
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm"
                                />
                                <input
                                    type="email"
                                    name={`new_player_${i}_email`}
                                    placeholder="Email"
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
                    <p className="text-green-800 font-medium">This group is full (8/8 Members).</p>
                    <p className="text-sm text-green-600">Remove a member to invite someone new.</p>
                </div>
            )}

            {/* Feedback & Actions */}
            <div className="flex items-center justify-between">
                {state.message && (
                    <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
                        {state.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-brand-orange text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 ml-auto"
                >
                    <Save className="w-4 h-4" />
                    {isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    )
}
