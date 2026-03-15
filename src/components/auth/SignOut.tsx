import { handleSignOut } from "@/app/actions/auth"

export function SignOut() {
    return (
        <form action={handleSignOut}>
            <button className="text-sm text-gray-700 hover:text-brand-orange transition-colors w-full text-left px-4 py-2">
                Sign Out
            </button>
        </form>
    )
}
