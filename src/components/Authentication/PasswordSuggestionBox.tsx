import React, { useEffect, useState } from 'react';
import { allowedPasswordChars } from '../../config/CommonConstant';

interface PasswordSuggestion {
	show: boolean;
	value: string;
}
const PasswordSuggestionBox = ({
	show,
	value,
}: PasswordSuggestion): JSX.Element => {
	const [number, validateNumber] = useState(false);
	const [splChar, validateSplChar] = useState(false);
	const [smallAlpha, validateSmallAlpha] = useState(false);
	const [capsAlpha, validateCapsAlpha] = useState(false);
	const [minChar, validateMinChar] = useState(false);
	const [restrictedChar, validateRestrictedChar] = useState(false);

	const onChangeSuggest = (value: string | null): void => {
		if (value) {
			const passwordValue = value.match(allowedPasswordChars);
			if (passwordValue === null) {
				validateRestrictedChar(true);
			} else {
				validateRestrictedChar(false);
			}
			const lowerCaseLetters = /[a-z]/g;
			if (value.match(lowerCaseLetters)) {
				validateSmallAlpha(true);
			} else {
				validateSmallAlpha(false);
			}

			const upperCaseLetters = /[A-Z]/g;
			if (value.match(upperCaseLetters)) {
				validateCapsAlpha(true);
			} else {
				validateCapsAlpha(false);
			}

			const numbers = /[0-9]/g;
			if (value.match(numbers)) {
				validateNumber(true);
			} else {
				validateNumber(false);
			}
			const splCharacter = /[!@#$%^*]/g;
			if (value.match(splCharacter)) {
				validateSplChar(true);
			} else {
				validateSplChar(false);
			}

			if (value.length >= 8) {
				validateMinChar(true);
			} else {
				validateMinChar(false);
			}
		}
	};

	useEffect(() => {
		onChangeSuggest(value);
	}, [value]);

	const matchedValue = value.match(allowedPasswordChars);

	return (
		<div className="mt-4 ml-6">
			<div className="text-xs py-4 absolute bg-white rounded-sm z-10 px-6 py-4 shadow-lg shadow-gray-500/50 flex justify-end">
					{show === true ? (
						<>
							{restrictedChar ? (
								<>
									<label></label>
									<div className="">
										<div className="text-base text-primary-700">
											Password must contains :
											<>
												<div
													className={
														minChar
															? `text-green-500 flex p-0.5 items-center`
															: `text-red-500 flex p-0.5 items-center`
													}
												>
													{minChar ? (
														<svg
															className={`w-4 h-4 text-green-500 dark:text-white mr-2`}
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 20 20"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
															/>
														</svg>
													) : (
														<svg
															className="w-4 h-4 text-red-500 dark:text-white mr-2"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 20 20"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
															/>
														</svg>
													)}
													Minimum of 8 characters.
												</div>
												<div
													className={
														capsAlpha
															? `text-green-500 flex p-0.5 items-center`
															: `text-red-500 flex p-0.5 items-center`
													}
												>
													{capsAlpha ? (
														<svg
															className={`w-4 h-4 text-green-500 dark:text-white mr-2`}
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 20 20"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
															/>
														</svg>
													) : (
														<svg
															className="w-4 h-4 text-red-500 dark:text-white mr-2"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 20 20"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
															/>
														</svg>
													)}
													At least 1 uppercase letter.
												</div>
												<div
													className={
														smallAlpha
															? `text-green-500 flex p-0.5 items-center`
															: `text-red-500 flex p-0.5 items-center`
													}
												>
													{smallAlpha ? (
														<svg
															className="w-4 h-4 text-green-500 dark:text-white mr-2"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 20 20"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
															/>
														</svg>
													) : (
														<svg
															className="w-4 h-4 text-red-500 dark:text-white mr-2"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 20 20"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
															/>
														</svg>
													)}
													At least 1 lowercase letter.
												</div>
												<div
													className={
														number
															? `text-green-500 flex p-0.5 items-center`
															: `text-red-500 flex p-0.5 items-center`
													}
												>
													{number ? (
														<svg
															className={`w-4 h-4 text-green-500 dark:text-white mr-2`}
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 20 20"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
															/>
														</svg>
													) : (
														<svg
															className="w-4 h-4 text-red-500 dark:text-white mr-2"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 20 20"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
															/>
														</svg>
													)}
													At least 1 numeric character.
												</div>
												<div
													className={
														splChar
															? `text-green-500 flex p-0.5 items-center`
															: `text-red-500 flex p-0.5 items-center`
													}
												>
													{splChar ? (
														<svg
															className="w-4 h-4 text-green-500 dark:text-white mr-2"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 20 20"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
															/>
														</svg>
													) : (
														<svg
															className="w-4 h-4 text-red-500 dark:text-white mr-2"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 20 20"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
															/>
														</svg>
													)}
													At least 1 special character.
												</div>
											</>
										</div>
									</div>
								</>
							) : (
								<>
									{matchedValue && (
										<div className="text-red-700">
											{matchedValue.length > 1
												? 'Following characters are not allowed: '
												: 'Following character is not allowed: '}
											<br />
											<strong>
												{matchedValue
													.filter(
														(c, index) => matchedValue.indexOf(c) === index,
													)
													.join(' ')}
											</strong>
										</div>
									)}
								</>
							)}
						</>
					) : (
						<label>{''}</label>
					)}
			</div>
		</div>
	);
};

export default PasswordSuggestionBox;
