export const TextTittlecase = (text: string): string => {
	return text.charAt(0).toUpperCase() + text.slice(1);
};

export const copyText = (copiedText: string | undefined) => {
	if (copiedText) {
		navigator.clipboard.writeText(copiedText);
	}
};
