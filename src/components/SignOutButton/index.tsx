import { pathRoutes } from "../../config/pathRoutes"

const SignOutButton = () => {

    const signOut = async () => {
        await localStorage.clear()
        window.location.href = pathRoutes.auth.sinIn
    }
    return (
        <a onClick={signOut}
            className="cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
            role="menuitem">Sign out</a>
    )
}

export default SignOutButton