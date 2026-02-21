import { signIn } from "@/auth"

export function SignIn() {
    return (
        <form
            action={async () => {
                "use server"
                await signIn()
            }}
        >
            <button className="bg-brand-orange text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors font-medium">
                Sign In
            </button>
        </form>
    )
}
