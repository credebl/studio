import { envConfig } from '../../config/envConfig';

const FooterBar = () => {
    return (
        <footer className="bg-white dark:bg-gray-800">
            <div className="md:flex md:items-center md:justify-between p-3">
                <p className="text-sm text-center text-gray-500">
                    &copy; CREDEBL a Series of LF Projects, LLC | For web site terms of use, trademark policy and other project policies please see
                    <a href="https://lfprojects.org/" className="underline" target="_blank"
                    > https://lfprojects.org
                    </a>
                </p>
            </div>
        </footer>
    )
}

export default FooterBar;
