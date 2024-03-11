import React from 'react'
import { envConfig } from '../../config/envConfig';

const NavBar = () => {
    return (
        <nav
            className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 px-3 py-3 lg:px-5 lg:pl-3"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-start">
                <a className="flex ml-2 md:mr-24" href="/">
                        <img
                            src={envConfig.PLATFORM_DATA.logo}
                            className="h-8 mr-3"
                            alt={`${envConfig.PLATFORM_DATA.name} Logo`}
                        />
                        <span
                            className="ml-2 self-center text-2xl font-semibold whitespace-nowrap text-black dark:text-white"
                        >{envConfig.PLATFORM_DATA.name}</span>

                    </a>
                </div>
            </div>
        </nav>
    )
}

export default NavBar;