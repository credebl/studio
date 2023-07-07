'use client';

import { Card } from 'flowbite-react';
import type { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';

const SchemaCard = (props: { schemaName: string, version:string  }) => {
  return (
    <Card  style={{ width: '500px' }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
         {props.schemaName}
        </h5>
         <p>
            Version: {props.version}
          </p>
        </div>
        <a
          className="text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-500"
          href="#"
        >
          <p>
            View
          </p>
        </a>
      </div>
      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          <li className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  Neil Sims
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  email@windster.com
                </p>
              </div>
              <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                $320
              </div>
            </div>
          </li>
        </ul>
      </div>
    </Card>
  )
}


export default SchemaCard


