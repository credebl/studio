'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { HiAdjustments, HiClipboardList, HiUserCircle } from 'react-icons/hi';

import BreadCrumbs from '../../components/BreadCrumbs'
import { MdDashboard } from 'react-icons/md';

import React from 'react';
import Subscription from './subscription';



const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
};


const Billing = () =>
{
    return (
        <div className="pt-6">
            <div className="pl-6 mb-4 col-span-full xl:mb-2">
                <BreadCrumbs />
            </div>

            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <ul className="pl-5 flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
                    <li className="mr-2" role="presentation">
                        <button className="text-xl inline-block p-4 border-b-2 rounded-t-lg " id="profile-tab" data-tabs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">OrgProfile</button>
                    </li>
                    <li className="mr-2" role="presentation">
                        <button className="text-xl inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="dashboard-tab" data-tabs-target="#dashboard" type="button" role="tab" aria-controls="dashboard" aria-selected="true">Subscription</button>
                    </li>
                </ul>
            </div>
            <div id="myTabContent">
                <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                    
                </div>
                <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="dashboard" role="tabpanel" aria-labelledby="dashboard-tab">
                <Subscription />
                </div>
            </div>


        </div>
    )
}

export default Billing;
