'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { HiAdjustments, HiClipboardList, HiUserCircle } from 'react-icons/hi';

import BreadCrumbs from '../../BreadCrumbs';
import Invitations from '../invitations/Invitations';
import { MdDashboard } from 'react-icons/md';
import Members from './Members';
import React from 'react';

const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
};


const Users = () => {

    return (
        <div className="pt-2">
            <div className="pl-6 mb-4 col-span-full xl:mb-2">
                <BreadCrumbs />
            </div>

            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <ul className="pl-5 flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
                    <li className="mr-2">
                        <button className="text-xl inline-block p-4 border-b-2 rounded-t-lg " id="profile-tab" data-tabs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="true">Users</button>
                    </li>
                    <li className="mr-2">
                        <button className="text-xl inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="dashboard-tab" data-tabs-target="#dashboard" type="button" role="tab" aria-controls="dashboard" aria-selected="false">Invitations</button>
                    </li>
                </ul>
            </div>
            <div id="myTabContent">
                <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                    <Members />
                </div>
                <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="dashboard" role="tabpanel" aria-labelledby="dashboard-tab">
                    <Invitations />
                </div>
            </div>


        </div>
    )
}

export default Users;
