import checkEcosystem from '../../config/ecosystem'
import { pathRoutes } from '../../config/pathRoutes'

const EcosystemSidebarOption = () => {
    const { isEnabledEcosystem } = checkEcosystem()

    if (isEnabledEcosystem) {
        return (
            <li>
                <button
                    type="button"
                    className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    aria-controls="dropdown-ecosystems"
                    data-collapse-toggle="dropdown-ecosystems"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                        width="18"
                        height="17"
                        fill="none"
                        viewBox="0 0 25 25"
                    >
                        <path
                            fill="currentColor"
                            d="M23 9.487h-5.27V8.184a.997.997 0 0 0-.999-.999h-1.895v-.818c.872-.685 1.376-1.665 1.376-2.708C16.212 1.64 14.326 0 12.005 0 9.683 0 7.798 1.64 7.798 3.659c0 1.043.504 2.023 1.376 2.708v.818H7.278a.998.998 0 0 0-.999 1v1.302H1a.998.998 0 0 0-.999 1V23A.996.996 0 0 0 1 24h22c.554 0 1-.446 1-1V10.487a1 1 0 0 0-1-.999ZM10.669 4.971c-.549-.318-.877-.808-.877-1.312 0-.901 1.009-1.66 2.209-1.66 1.195 0 2.209.759 2.209 1.66 0 .504-.328.999-.877 1.312a1 1 0 0 0-.5.867V7.18h-1.665V5.838c0-.357-.19-.685-.5-.867ZM8.273 9.184h7.46v2.566h-7.46V9.184Zm13.729 12.818H1.998h14.733L19.5 22l2.497.002h.005Z"
                        />
                    </svg>
                    <span
                        className="flex-1 ml-3 text-left whitespace-nowrap"
                        sidebar-toggle-item
                    >
                        Ecosystem
                    </span>
                    <svg
                        sidebar-toggle-item
                        className="w-6 h-6 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white sidebar-expand-menu-icon"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </button>
                <ul id="dropdown-ecosystems" className="py-2 space-y-2">
                    <li>
                        <a
                            href={pathRoutes.ecosystem.profile}
                            className="flex items-center p-2 text-base text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="none"
                                viewBox="0 0 25 22"
                            >
                                <path
                                    stroke="#6B7280"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.25"
                                    d="M4 4h3.125M4 6.885h3.125M1 1h15.702M4.695 10h.962m1.453 0h.96m1.422 0h.962m1.452 0h.962M17 1v4.952m0 3.715V13H1V1"
                                />
                                <path
                                    fill="#6B7280"
                                    d="M14 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-3.816 0a1.316 1.316 0 1 0 2.632 0 1.316 1.316 0 0 0-2.633 0Z"
                                />
                                <path
                                    stroke="#6B7280"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.25"
                                    d="M7.164 13.647v1.47h7.53m-6.024.589v2.353h6.526m-4.518.294V21h11.044l3.263-1.177m0 0v-9.705m0 9.705h3.012m-3.012-9.705L23.48 8.353 16.2 6l-1.004.588-.25 1.47.501 1.177 3.263.883.502 1.764 1.004 1.765h1.506m3.263-3.53h3.012"
                                />
                            </svg>
                            <span className="ml-2">Profile</span>
                        </a>
                    </li>
                    <li>
                        <a
                            href={pathRoutes.ecosystem.endorsements}
                            className="flex items-center p-2 text-base text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="none"
                                viewBox="0 0 25 25"
                            >
                                <path
                                    fill="#6B7280"
                                    d="M19.322 8.824h-4.427V7.612c0-.515-.375-.93-.84-.93h-1.592v-.76a3.335 3.335 0 0 0 1.156-2.52C13.62 1.527 12.035 0 10.085 0 8.135 0 6.55 1.526 6.55 3.403c0 .97.424 1.881 1.157 2.519v.76H6.114c-.465 0-.84.415-.84.93v1.212H.84c-.465 0-.839.414-.839.93v11.638c0 .515.374.93.84.93h12.78l-.993-1.86 7.534-7.962V9.753c0-.51-.374-.93-.84-.93Zm-10.36-4.2c-.461-.296-.737-.752-.737-1.221 0-.838.848-1.544 1.856-1.544 1.004 0 1.855.706 1.855 1.544 0 .47-.275.93-.736 1.22a.952.952 0 0 0-.42.807v1.248H9.381V5.43a.958.958 0 0 0-.42-.806ZM6.948 8.54h6.267v2.141H6.949v-2.14Zm5.678 11.922H1.68v-9.78h16.804l.065 1.37 1.21.447h.403l-7.534 7.963Z"
                                />
                                <path
                                    fill="#6B7280"
                                    d="M24.997 17.854c0 3.945-2.889 7.143-6.452 7.143s-6.451-3.198-6.451-7.143 2.888-7.143 6.451-7.143c3.563 0 6.452 3.198 6.452 7.143Zm-11.292 0c0 2.96 2.167 5.358 4.84 5.358s4.84-2.399 4.84-5.358c0-2.96-2.167-5.359-4.84-5.359s-4.84 2.4-4.84 5.359Z"
                                />
                                <path
                                    stroke="#6B7280"
                                    stroke-linecap="round"
                                    stroke-width="1.5"
                                    d="m15.328 17.984 2.24 2.55 4.48-4.464"
                                />
                            </svg>
                            <span className="ml-2">Endorsements</span>
                        </a>
                    </li>
                </ul>
            </li>
        )
    }

    return <></>
}

export default EcosystemSidebarOption