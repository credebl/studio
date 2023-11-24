export const TextTittlecase = (text: string): string => {
	console.log(66, text);
  
	const words = text.split(',');
  
	const capitalizedWords = words.map((word) => word.trim().charAt(0).toUpperCase() + word.trim().slice(1));
  
	const result = capitalizedWords.join(', ');
  
	return result;
  };
  
  export const copyText = (copiedText: string | undefined) => {
	if (copiedText) {
	  navigator.clipboard.writeText(copiedText);
	}
  };
  
  
  