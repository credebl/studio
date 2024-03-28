import LogoFile from '../../commonComponents/LogoFile';

const NavBar = () => {
    return (
        <nav
            className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 px-3 py-3 lg:px-5 lg:pl-3"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-start">
                <a className="flex ml-2 md:mr-24" href="/">
                        <LogoFile />

                    </a>
                </div>
            </div>
        </nav>
    )
}

export default NavBar;