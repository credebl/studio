import { useState } from 'react';
import BreadCrumbs from '../../BreadCrumbs';
import Invitations from '../invitations/Invitations';
import Members from './Members';

const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
};


const Users = () => {
    const [activeTab, setActiveTab] = useState('users');

    return (
        <div className="pt-2">
            <div className="pl-6 mb-4 col-span-full xl:mb-2">
                <BreadCrumbs />
            </div>

            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <ul className="pl-5 flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" role="tablist">
                    <li className="mr-2">
                        <button
                            className={`text-xl inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'users' ? 'border-b-2 text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'border-blue-100 dark:text-gray-400 text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 hover:border-gray-300 dark:border-transparent'}`}
                            id="users-tab"
                            onClick={() => setActiveTab('users')}
                            type="button"
                            role="tab"
                            aria-controls="users"
                            aria-selected={activeTab === 'users'}
                        >
                            Users
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`text-xl inline-block p-4  rounded-t-lg ${activeTab === 'invitations' ? 'border-b-2 text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'border-blue-100 dark:text-gray-400 text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 dark:border-transparent'}`}
                            id="invitations-tab"
                            onClick={() => setActiveTab('invitations')}
                            type="button"
                            role="tab"
                            aria-controls="invitations"
                            aria-selected={activeTab === 'invitations'}
                        >
                            Invitations
                        </button>
                    </li>
                </ul>
            </div>
            <div id="myTabContent">
                <div className={`${activeTab === 'users' ? 'block' : 'hidden'} m-4 rounded-lg bg-gray-50 dark:bg-gray-800`} id="users" role="tabpanel" aria-labelledby="users-tab">
                    <Members />
                </div>
                <div className={`${activeTab === 'invitations' ? 'block' : 'hidden'} m-4 rounded-lg bg-gray-50 dark:bg-gray-800`} id="invitations" role="tabpanel" aria-labelledby="invitations-tab">
                    <Invitations />
                </div>
            </div>
        </div>
    );
};

export default Users;
