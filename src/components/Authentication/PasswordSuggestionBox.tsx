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
	const [unwantedChar, validateUnwantedChar] = useState(false);

	const onChangeSuggest = (value: string | null): void => {
		if (value) {
			const unknown = value.match(allowedPasswordChars);
			if (unknown === null) {
				validateUnwantedChar(true);
			} else {
				validateUnwantedChar(false);
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

	const updatedValue = value.match(allowedPasswordChars);

	return (
		<div className=''>
			{show === true ? (
				<>
					{unwantedChar ? (
						<>
							<label></label>
							<div className="">
								<div className="text-base text-primary-700">
									Password must contains:
									<>
										<div
											className={
												minChar
													? `text-green-400 flex p-0.5 items-center`
													: `text-red-400 flex p-0.5 items-center`
											}
										>
											{minChar ? (
												<svg
													className={`w-4 h-4 text-green-400 dark:text-white mr-2`}
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
													className="w-4 h-4 text-red-400 dark:text-white mr-2"
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
											Password must be a minimum of 8 characters.
										</div>
										<div
											className={
												capsAlpha
													? `text-green-400 flex p-0.5 items-center`
													: `text-red-400 flex p-0.5 items-center`
											}
										>
											{capsAlpha ? (
												<svg
													className={`w-4 h-4 text-green-400 dark:text-white mr-2`}
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
													className="w-4 h-4 text-red-400 dark:text-white mr-2"
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
										Password must contain at least 1 uppercase letter.
										</div>
										<div
											className={
												smallAlpha
													? `text-green-400 flex p-0.5 items-center`
													: `text-red-400 flex p-0.5 items-center`
											}
										>
											{smallAlpha ? (
												<svg
													className="w-4 h-4 text-green-400 dark:text-white mr-2"
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
													className="w-4 h-4 text-red-400 dark:text-white mr-2"
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
											Password must contain at least 1 lowercase letter.
										</div>
										<div
											className={
												number
													? `text-green-400 flex p-0.5 items-center`
													: `text-red-400 flex p-0.5 items-center`
											}
										>
											{number ? (
												<svg
													className={`w-4 h-4 text-green-400 dark:text-white mr-2`}
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
													className="w-4 h-4 text-red-400 dark:text-white mr-2"
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
											Password must contain at least 1 numeric character.
										</div>
										<div
											className={
												splChar
													? `text-green-400 flex p-0.5 items-center`
													: `text-red-400 flex p-0.5 items-center`
											}
										>
											{splChar ? (
												<svg
													className="w-4 h-4 text-green-400 dark:text-white mr-2"
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
													className="w-4 h-4 text-red-400 dark:text-white mr-2"
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
											Password must contain at least 1 special character.
										</div>
									</>
								</div>
							</div>
						</>
					) : (
						<>
							{updatedValue && (
								<div className="text-red-700 flex ">
									{updatedValue.length > 1
										? 'Following characters are not allowed: '
										: 'Following character is not allowed: '}
									<br />
									<strong>
										{updatedValue
											.filter((c, index) => updatedValue.indexOf(c) === index)
											.join(' ')}
									</strong>
								</div>
							)}
						</>
					)}
				</>
			) : (
				<label>{""}</label>
			)}
		</div>
	);
};

export default PasswordSuggestionBox;
