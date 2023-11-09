import { Tooltip } from 'flowbite-react';
import React from 'react'

export default function EndorsementTooltip() {

    const tooltipData = [
        {
            outerClass: 'hidden sm:block dark:hidden',
            placement: 'top-start',
            style: 'light',
            content: (
                <img
                    src="/images/Endorsement_Infographic_Ligh_Mode.svg"
                    height={600}
                    width={450}
                />
            ),
        },
        {
            outerClass: 'block sm:hidden dark:hidden',
            placement: '',
            style: 'light',
            content: (
                <img
                    src="/images/Endorsement_Infographic_Ligh_Mode.svg"
                    height={600}
                    width={450}
                />
            ),
        },
        {
            outerClass: 'hidden dark:block',
            placement: 'top-start',
            style: 'dark',
            content: (
                <img
                    src="/images/Endorsement_Infographic_Dark_Mode.svg"
                    height={600}
                    width={450}
                />
            ),
        },
    ];

  return (
    <div>

                                           {tooltipData.map((item) => (
												<div key={item.outerClass} className={item.outerClass}>
													<Tooltip
														className="shadow-[0_0_12px_12px_rgba(0,0,0,0.1)]"
														placement={item.placement}
														style={item.style}
														content={item.content}
													>
														<svg
															className="ml-2"
															xmlns="http://www.w3.org/2000/svg"
															width="12"
															height="12"
															fill="none"
															viewBox="0 0 12 12"
														>
															<path
																fill="#1D4EB5"
																fillRule="evenodd"
																d="M0 6a6 6 0 1 1 12 0A6 6 0 0 1 0 6ZM6 .837a5.163 5.163 0 1 0 0 10.326A5.163 5.163 0 0 0 6 .837Z"
																clipRule="evenodd"
															/>
															<path
																fill="#1D4EB5"
																d="M6 9.21a.419.419 0 0 0 .42-.42V5.443a.419.419 0 0 0-.838 0v3.349c0 .231.187.418.419.418Zm0-6a.558.558 0 1 1 0 1.117.558.558 0 0 1 0-1.116Z"
															/>
														</svg>
													</Tooltip>
												</div>
											))}
                                           </div>
  )
}
