import React from 'react'
import { PLATFORM_DATA } from '../../app/constants';

const NavBar = () => {
    return (
        <nav
            className="bg-white border-b border-gray-200 sm:p-2"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-start">
                    <a className="flex ml-2 md:mr-24" href="/">
                        <img
                            src={PLATFORM_DATA.logo}
                            className="h-8 mr-3"
                            alt={`${PLATFORM_DATA.name} Logo`}
                        />
                        <span
                            className="ml-2 self-center text-2xl font-semibold whitespace-nowrap text-black"
                        >{PLATFORM_DATA.name}</span>

                    </a>
                </div>
            </div>
        </nav>
    )
}

export default NavBar;