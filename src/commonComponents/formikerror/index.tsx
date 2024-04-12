import React from 'react';

const ErrorMessage = ({ error, touched }) => {
	return touched && <span className="text-red-500 text-xs">{error}</span>;
};
export default ErrorMessage;
