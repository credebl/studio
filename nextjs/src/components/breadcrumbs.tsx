'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import { IconSlash } from '@tabler/icons-react';
import { Fragment } from 'react';

export function Breadcrumbs() {
  const items = useBreadcrumbs();

  if (items.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const decodedTitle = decodeURIComponent(item.title);

          return (
            <Fragment key={item.link ? item.link : `${item.title}-${index}`}>
              {index !== items.length - 1 && (
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink href={item.link || `/schemas/${item.title}`}>
                    {decodedTitle}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}
              {index < items.length - 1 && (
                <BreadcrumbSeparator className='hidden md:block'>
                  <IconSlash />
                </BreadcrumbSeparator>
              )}
              {index === items.length - 1 && (
                <BreadcrumbPage>{decodedTitle}</BreadcrumbPage>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
