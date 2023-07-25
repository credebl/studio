'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { HiAdjustments, HiClipboardList, HiUserCircle } from 'react-icons/hi';

import BreadCrumbs from '../../BreadCrumbs';
import Invitations from '../invitations/Invitations';
import { MdDashboard } from 'react-icons/md';
import Members from './Members';

const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
};


const Users = () => {
  
    return (
        <div className="px-4 pt-6">
            <div className="mb-4 col-span-full xl:mb-2">

                <BreadCrumbs />
                {/* <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    Users
                </h1> */}
            </div>
            
<div className="mb-4 border-b border-gray-200 dark:border-gray-700">
    <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
        <li className="mr-2" role="presentation">
            <button className="inline-block p-4 border-b-2 rounded-t-lg" id="profile-tab" data-tabs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Users</button>
        </li>
        <li className="mr-2" role="presentation">
            <button className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="dashboard-tab" data-tabs-target="#dashboard" type="button" role="tab" aria-controls="dashboard" aria-selected="false">Invitations</button>
        </li>      
    </ul>
</div>
<div id="myTabContent">
    <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="profile" role="tabpanel" aria-labelledby="profile-tab">
        <Members/>
    </div>
    <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="dashboard" role="tabpanel" aria-labelledby="dashboard-tab">
        <Invitations/>
    </div>   
</div>

           
        </div>
    )
}

export default Users;