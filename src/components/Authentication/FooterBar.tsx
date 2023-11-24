import React from 'react'

const FooterBar = () => {
    return (
        <footer className="bg-white border-b border-gray-200 sm:py-2">

            <div className="md:flex md:items-center md:justify-between p-3">
                <p className="text-sm text-center text-gray-500">
                    &copy; 2019 - {new Date().getFullYear()} 
                    <a className="hover:underline" target="_blank"
                    >Blockster Labs
                    </a> | All rights reserved.
                </p>

            </div>
        </footer>
    )
}

export default FooterBar;
