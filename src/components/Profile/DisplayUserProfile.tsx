const DisplayUserProfile = ({ toggleEditProfile }: { toggleEditProfile: () => void }) => {

    return (
        <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 md:p-8 dark:bg-gray-800">

            <div className="flow-root">
                <ul>

                    <li className="flex items-start justify-between pb-4">

                        <img
                            className="mr-4 mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                            src="https://play-lh.googleusercontent.com/i1qvljmS0nE43vtDhNKeGYtNlujcFxq72WAsyD2htUHOac57Z9Oiew0FrpGKlEehOvo=w240-h480-rw"
                            alt="Profile picture"
                        />

                        <button
                            type="button"
                            className=""
                            onClick={toggleEditProfile}
                        >
                            <svg aria-hidden="true"
                                className="mr-1 mt-10 -ml-1 w-5 h-5"

                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                                color='#3558A8'
                            >
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z">

                                </path>
                                <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>

                        </button>


                    </li>

                    <li className="py-3">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-normal text-gray-500 truncate dark:text-gray-400">
                                    Name
                                </p>
                                <p className="text-lg text-black truncate dark:text-white">


                                    Bhavana Karwade
                                </p>
                            </div>

                        </div>
                    </li>
                    <li className="py-3">
                        <div className="flex items-center space-x-4">

                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-normal text-gray-500 truncate dark:text-gray-400">
                                    Email
                                </p>
                                <p className="text-lg text-black truncate dark:text-white">

                                    bhavana13@yopmail.com
                                </p>
                            </div>
                        </div>
                    </li>

                    <li className="py-3">
                        <div className="flex items-center space-x-4">

                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-normal text-gray-500 truncate dark:text-gray-400">

                                    Passkey
                                </p>
                                <p className="text-lg text-black truncate dark:text-white">
                                    abcdefghijklmnopqrstuvwxyz
                                </p>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default DisplayUserProfile;
