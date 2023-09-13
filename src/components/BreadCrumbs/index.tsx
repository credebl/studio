'use client';

import { useEffect, useMemo, useState } from 'react';

import { Breadcrumb } from 'flowbite-react';
import { HiHome } from 'react-icons/hi';

interface BreadCrumbI {
    href: string;
    text: string;
}

export default function BreadCrumbs() {

    const [breadcrumbList, setBreadcrumbs] = useState<BreadCrumbI[]>([]) 

    useEffect(() => {

        const pathUrl = window.location.pathname
       const asPathNestedRoutes = pathUrl
        .split('/')
        .filter((v) => v.length > 0);

      const crumblist = asPathNestedRoutes.map((subpath, idx) => {
        const href = `/${asPathNestedRoutes.slice(0, idx + 1).join('/')}`;
        return { href, text: subpath };
      });

      setBreadcrumbs(crumblist)

    }, [])

    return (
        <Breadcrumb
            aria-label="Solid background breadcrumb example"
            className="bg-gray-50 py-3 dark:bg-gray-900"
        >

           <div className='flex flex-wrap'>
					 <Breadcrumb.Item
                href="/dashboard"
                icon={HiHome}
            >
                <p>
                    Home
                </p>
            </Breadcrumb.Item>

            {breadcrumbList.map((crumb, idx) => {
                return (
                    <Breadcrumb.Item
                    href={crumb.href}
                        key={idx}
                    >
                        {crumb.text.charAt(0).toUpperCase() + crumb.text.slice(1)}
                    </Breadcrumb.Item>
                );
            })}
					 </div>
        </Breadcrumb>
    )
}


