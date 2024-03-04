import { removeFromLocalStorage } from '../../api/Auth';
import { storageKeys } from '../../config/CommonConstant';

const SignOutButton = () => {
	const signOut = async () => {
		await removeFromLocalStorage(storageKeys.TOKEN);
		await removeFromLocalStorage(storageKeys.ORG_INFO);
		await removeFromLocalStorage(storageKeys.USER_EMAIL);
		await removeFromLocalStorage(storageKeys.ORG_ID);
		await removeFromLocalStorage(storageKeys.ORG_ROLES);
		await removeFromLocalStorage(storageKeys.ECOSYSTEM_ID);
		await removeFromLocalStorage(storageKeys.ECOSYSTEM_ROLE);
		await removeFromLocalStorage(storageKeys.USER_PROFILE);
		await removeFromLocalStorage(storageKeys.ORG_DETAILS);
		await removeFromLocalStorage(storageKeys.CRED_DEF_ID);
		await removeFromLocalStorage(storageKeys.SCHEMA_ATTR);
		await removeFromLocalStorage(storageKeys.LEDGER_ID);
		
		const response = await fetch('/api/auth/signout', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (response.redirected) {
			window.location.assign(response.url);
		}
	};
	return (
		<button
			onClick={signOut}
			className="w-full text-start cursor-pointer block px-4 py-2 my-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white flex space-x-2"
			role="menuitem"
		>
			{' '}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="20"
				viewBox="0 0 16 20"
				fill="none"
				className='ml-[2px]'
			>
				<path
					d="M10.4971 16.3973C10.3828 16.3978 10.2695 16.3752 10.164 16.3308C10.0584 16.2863 9.96261 16.2209 9.88234 16.1384C9.7195 15.973 9.62799 15.7487 9.62799 15.5148C9.62799 15.281 9.7195 15.0566 9.88234 14.8912L13.907 10.8083L9.88234 6.72536C9.79686 6.64458 9.72832 6.54715 9.68076 6.4389C9.63321 6.33065 9.60769 6.21379 9.60561 6.0953C9.60352 5.97682 9.62509 5.85912 9.66882 5.74923C9.71254 5.63935 9.77761 5.53953 9.86031 5.45573C9.94289 5.37193 10.0412 5.30588 10.1496 5.26149C10.2579 5.21711 10.3739 5.19531 10.4907 5.1974C10.6075 5.19949 10.7226 5.22543 10.8294 5.27366C10.9361 5.32189 11.0321 5.39143 11.1118 5.47814L15.7511 10.1846C15.9141 10.3501 16.0055 10.5745 16.0055 10.8083C16.0055 11.0422 15.9141 11.2664 15.7511 11.4319L11.1118 16.1384C11.0315 16.2209 10.9357 16.2863 10.8302 16.3308C10.7246 16.3752 10.6113 16.3978 10.4971 16.3973Z"
					fill="#455A64"
				/>
				<path
					d="M7.08278 19.5978H3.39047C2.96369 19.614 2.53751 19.555 2.13633 19.4242C1.73515 19.2935 1.36684 19.0935 1.05248 18.8358C0.738105 18.578 0.483853 18.2675 0.304272 17.9221C0.124678 17.5767 0.0232748 17.2031 0.00585938 16.8227V3.17803C0.0232748 2.79766 0.124678 2.42408 0.304272 2.07867C0.483853 1.73326 0.738105 1.4228 1.05248 1.16505C1.36684 0.907304 1.73515 0.707327 2.13633 0.576572C2.53751 0.445806 2.96369 0.386828 3.39047 0.403007H7.08278C7.3276 0.403007 7.56239 0.48968 7.7355 0.643951C7.9086 0.798233 8.00586 1.00747 8.00586 1.22564C8.00586 1.44383 7.9086 1.65306 7.7355 1.80733C7.56239 1.96161 7.3276 2.04828 7.08278 2.04828H3.39047C3.02502 2.01995 2.66137 2.11809 2.37493 2.3223C2.08848 2.52652 1.90123 2.82117 1.85201 3.14512V16.8227C1.90123 17.1467 2.08848 17.4414 2.37493 17.6456C2.66137 17.8498 3.02502 17.948 3.39047 17.9196H7.08278C7.3276 17.9196 7.56239 18.0063 7.7355 18.1606C7.9086 18.3149 8.00586 18.5241 8.00586 18.7422C8.00586 18.9605 7.9086 19.1697 7.7355 19.324C7.56239 19.4782 7.3276 19.5649 7.08278 19.5649V19.5978Z"
					fill="#455A64"
				/>
				<path
					d="M15.4303 11.6H6.98225C6.82949 11.6 6.68298 11.5157 6.57496 11.3657C6.46694 11.2157 6.40625 11.0122 6.40625 10.8C6.40625 10.5878 6.46694 10.3843 6.57496 10.2343C6.68298 10.0843 6.82949 10 6.98225 10H15.4303C15.583 10 15.7295 10.0843 15.8375 10.2343C15.9456 10.3843 16.0063 10.5878 16.0063 10.8C16.0063 11.0122 15.9456 11.2157 15.8375 11.3657C15.7295 11.5157 15.583 11.6 15.4303 11.6Z"
					fill="#455A64"
				/>
			</svg>
			<span> Sign out</span>
		</button>
	);
};

export default SignOutButton;
