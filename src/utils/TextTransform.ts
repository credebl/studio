export const TextTittlecase = (text: string): string => {
	const roles = text.split(',');

	const capitalizedWords = roles.map(
		(role) => role.trim().charAt(0).toUpperCase() + role.trim().slice(1),
	);

	const result = capitalizedWords.join(', ');

	return result;
};

export const copyText = (copiedText: string | undefined) => {
	if (copiedText) {
		navigator.clipboard.writeText(copiedText);
	}
};
