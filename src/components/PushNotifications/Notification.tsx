import React from 'react';
import { useEffect, useState } from 'react';
import { asset } from '../../lib/data';
import { getSupabaseClient } from '../../supabase';
import { apiStatusCodes } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';
import { getAllNotificationList } from '../../api/Notification';
import DateTooltip from '../Tooltip';
import { dateConversion } from '../../utils/DateConversion';
import { Toast } from 'flowbite-react';
import { HiCheck } from 'react-icons/hi';

const WebNotification = () => {
  const [notification, setNotification] = useState<any>([]);
  const [newNotification, setNewNotification] = useState<any>([]);

  useEffect(() => {
    const channel = getSupabaseClient().channel('table_db_changes').on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: 'state=in.(completed)'
      },
      (payload: any) => {
        console.log("testNotifications:::::", payload);
        setNewNotification((prevNotification: any) => [...prevNotification, payload.new])
        setNotification((prevNotification: any) => [...prevNotification, payload.new]);
      }
    ).subscribe();
  }, [])

  useEffect(() => {
    // setTimeout(() => {
    getAllNotifications();
    // }, 1000)
  }, []);

  const getAllNotifications = async () => {
    try {
      const notificationList = await getAllNotificationList();
      const { data } = notificationList as unknown as AxiosResponse;
      console.log("data:::87687687", data)
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setNotification(data?.data);
        // setLoader(false);
      } else {
        // setLoader(false);
        // setAgentErrMessage(agentData as string);
      }

    } catch (error) {
      // setLoader(false);
      console.error("An error occurred:", error);
    }
  };


  console.log("notification:8987654", notification)
  console.log("newNotification", newNotification)
  return (
    <div>
      <button
        type="button"
        className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
        data-dropdown-toggle="notification-dropdown"
      >
        <span className="sr-only">View notifications</span>
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
          ></path>
        </svg>
      </button>
      <div style={{ position: 'absolute', top: 50, right: 0 }}>
        {newNotification.length > 0 && newNotification.map((notification, index) => (
          <Toast key={index}>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
            </div>
            <div className="ml-3 text-sm font-normal">
              You have recived a new {notification?.type} notification
            </div>
            <Toast.Toggle onClick={() => {
              const updatedNotifications = [...newNotification];
              updatedNotifications.splice(index, 1);
              setNewNotification(updatedNotifications);
            }} />
          </Toast>
        ))}
      </div>
      <div
        className="z-20 z-50 hidden max-w-sm my-4 overflow-hidden text-base list-none bg-white divide-y divide-gray-100 rounded shadow-lg dark:divide-gray-600 dark:bg-gray-700"
        id="notification-dropdown"
      >
        <div
          className="block px-4 py-2 text-base font-medium text-center text-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-500"
        >
          Notifications
        </div>
        <div>
          {notification &&
            notification.map((item, index) => (
              <a
                href="#"
                className="flex px-4 py-3 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600"
                key={index} // Don't forget to add a unique key for each mapped element
              >
                <div className="w-full pl-3">
                  <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                    {item.type === 'CONNECTION' ? (
                      <>
                        You have connected to{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {item.details}
                        </span>
                      </>
                    ) : item.type === 'ISSUANCE' ? (
                      'In progress'
                    ) : null}
                  </div>
                  <div className="text-xs font-medium text-primary-700 dark:text-primary-400">
                    <DateTooltip date={item?.createDateTime}>
                      {dateConversion(item?.createDateTime)}
                    </DateTooltip>
                  </div>
                </div>
              </a>
            ))}
        </div>

        <a
          href="#"
          className="block py-2 text-base font-normal text-center text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:underline"
        >
          <div className="inline-flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
              <path
                fill-rule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clip-rule="evenodd"></path>
            </svg>
            View all
          </div>
        </a>
      </div>
    </div>

  );
};

export default WebNotification;