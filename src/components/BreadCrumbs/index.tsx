'use client';

import { useEffect, useMemo, useState } from 'react';

import { Breadcrumb } from 'flowbite-react';
import { HiHome } from 'react-icons/hi';

interface BreadCrumbI {
	href: string;
	text: string;
}

export default function BreadCrumbs() {
	const [breadcrumbList, setBreadcrumbList] = useState<BreadCrumbI[]>([]);

	useEffect(() => {
		const pathUrl = window.location.pathname;
		const asPathNestedRoutes = pathUrl.split('/').filter((v) => v.length > 0);

		const crumblist = asPathNestedRoutes.map((subpath, idx) => {
			const href = `/${asPathNestedRoutes.slice(0, idx + 1).join('/')}`;
			return { href, text: subpath };
		});
		
		setBreadcrumbList(crumblist);
	}, []);

	return (
		<Breadcrumb
			aria-label="Solid background breadcrumb example"
			className="bg-gray-50 mt-2 dark:bg-gray-900"
		>
			<div className="flex flex-wrap">
				<Breadcrumb.Item href="/dashboard">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							fill="#6B7280"
							d="M6 19h3v-6h6v6h3v-9l-6-4.5L6 10v9Zm-2 2V9l8-6 8 6v12h-7v-6h-2v6H4Z"
						/>
					</svg>

					<p className='mb-0'>Home</p>
				</Breadcrumb.Item>

				{breadcrumbList.map((crumb, idx) => {
					const crumbData =
						crumb.text.charAt(0).toUpperCase() + crumb.text.slice(1);
					const routes = crumbData
						? crumbData
								?.split('-')
								.reduce(
									(s, c) =>
										s.charAt(0).toUpperCase() +
										s.slice(1) +
										' ' +
										(c.charAt(0).toUpperCase() + c.slice(1)),
								)
						: '';
					return (
						<Breadcrumb.Item className='mb-0' href={crumb.href} key={crumb.text}>
							{routes}
						</Breadcrumb.Item>
					);
				})}
			</div>
		</Breadcrumb>
	);
}
