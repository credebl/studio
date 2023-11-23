export const dateConversion = (date: string): string => {

	const newDate = new Date(date); 
	const now = new Date();

	const timeDifferenceInMilliseconds = now.getTime() - newDate.getTime();
	const timeDifferenceInSeconds = Math.floor(timeDifferenceInMilliseconds / 1000);

	if (timeDifferenceInSeconds < 60) {
		return (timeDifferenceInSeconds===1)? 'A second ago':`${timeDifferenceInSeconds} sec ago`;
	} 
	
	else if (timeDifferenceInSeconds < 3600) {
		const minutes = Math.floor(timeDifferenceInSeconds / 60);
		return (minutes===1)? 'A minute ago':`${minutes} minutes ago`;
	} 
	
	else if (timeDifferenceInSeconds < 86400) {
		const hours = Math.floor(timeDifferenceInSeconds / 3600);
		return (hours===1)? 'An hour ago':`${hours} hours ago`;
	} 
	
	else if (timeDifferenceInSeconds < 604800) {
		const days = Math.floor(timeDifferenceInSeconds / 86400);
		return (days===1)? 'Yesterday':`${days} days ago`;
	} 
	
	else if (timeDifferenceInSeconds < 2629440 ) {
		const weeks = Math.floor(timeDifferenceInSeconds / 604800);
		return (weeks===1)? 'Last Week':`${weeks} weeks ago`;
	} 
	
	else if (timeDifferenceInSeconds < 31579200 ) {
		const months = Math.floor( timeDifferenceInSeconds / 2629440);
		return (months===1)? 'Last Month':`${months} months ago`;
	}
	
	else {
		const months = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		  ];
		const year = newDate.getFullYear();
		const monthIndex = newDate.getMonth();
		const month = months[monthIndex];		
		const day = String(newDate.getDate()).padStart(2, '0');
		return `${month} ${day}, ${year}`;
	}
};
