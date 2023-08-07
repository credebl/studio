export const dateConversion = (date: string): string => {

	const newDate = new Date(date); 
	const now = new Date();

	const timeDifferenceInMilliseconds = now.getTime() - newDate.getTime();
	const timeDifferenceInSeconds = Math.floor(timeDifferenceInMilliseconds / 1000);

	if (timeDifferenceInSeconds < 60) {
		return `${timeDifferenceInSeconds} sec ago`;
	} else if (timeDifferenceInSeconds < 3600) {
		const minutes = Math.floor(timeDifferenceInSeconds / 60);
		return `${minutes} mins ago`;
	} else if (timeDifferenceInSeconds < 86400) {
		const hours = Math.floor(timeDifferenceInSeconds / 3600);
		return `${hours} hrs ago`;
	} else {
		const year = newDate.getFullYear();
		const month = String(newDate.getMonth() + 1).padStart(2, '0');
		const day = String(newDate.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
};
