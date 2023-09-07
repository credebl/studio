export const dateConversion = (date: string): string => {

	const newDate = new Date(date); 
	const now = new Date();

	const timeDifferenceInMilliseconds = now.getTime() - newDate.getTime();
	const timeDifferenceInSeconds = Math.floor(timeDifferenceInMilliseconds / 1000);

	if (timeDifferenceInSeconds < 60) {
		if(timeDifferenceInSeconds === 1){
			return 'A second ago';
		}
		else{
			return `${timeDifferenceInSeconds} sec ago`;
		}
	} 
	
	else if (timeDifferenceInSeconds < 3600) {
		const minutes = Math.floor(timeDifferenceInSeconds / 60);
		if(minutes === 1){
			return 'A minute ago';
		}
		return `${minutes} mins ago`;

	} 
	
	else if (timeDifferenceInSeconds < 86400) {
		const hours = Math.floor(timeDifferenceInSeconds / 3600);
		if(hours === 1) {
			return 'An hour ago';
		}
		return `${hours} hours ago`;
	} 
	
	else if (timeDifferenceInSeconds < 604800) {
		const days = Math.floor(timeDifferenceInSeconds / 86400);
		if(days === 1){
			return 'Yesterday';
		}
		return `${days} days ago`;
	} 
	
	
	else if (timeDifferenceInSeconds < 2629440 ) {
		const weeks = Math.floor(timeDifferenceInSeconds / 604800);
		if(weeks === 1){
			return 'Last week';
		}
		return `${weeks} weeks ago`;
	} 
	
	else if (timeDifferenceInSeconds < 31579200 ) {
		const months = Math.floor( timeDifferenceInSeconds / 2629440);
		if(months === 1){
			return 'Last month';
		}
		return `${months} months ago`;
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
