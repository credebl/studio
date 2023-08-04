'use client';

import ComingSoonImage from '../../assets/coming-soon.svg'
const EmailList = () => {

	return (
		<div className="flex justify-center items-center flex-1 bg-gray-100">
          <img src={ComingSoonImage} alt="Coming soon" className="max-w-md md:max-w-lg lg:max-w-2xl" />
        </div>
	)
}

export default EmailList
