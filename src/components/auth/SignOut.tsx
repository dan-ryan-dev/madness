import { signOut } from "@/auth"

export function SignOut() {
    return (
        <form
            action={async () => {
                "use server"
                await signOut()
            }}
        >
            <button className="text-sm text-gray-700 hover:text-brand-orange transition-colors w-full text-left px-4 py-2">
                Sign Out
            </button>
        </form>
    )
}
