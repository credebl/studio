import { Button } from 'flowbite-react';
import NavBar from './NavBar';
import FooterBar from './FooterBar';

const RegistrationSuccess = (props) => {
	const redirectSignInPage = () => {
		
		window.location.href = `/authentication/sign-in?email=${props.email.email}&showmsg=true`;
	};
	return (
		<div className="flex flex-col min-h-screen">
			<NavBar />

			<div className="flex flex-1 flex-col md:flex-row">
				<div className="md:w-3/5 w-full bg-blue-500 bg-opacity-10 lg:p-4 md:p-4">
					<div className="flex justify-center mt-16">
						<img src="/images/Passkey_Added.svg" alt="img" />
					</div>
				</div>

				<div className="md:w-2/5 w-full p-10 flex">
					<div className="w-full">
						<div className="mt-16 mb-24 flex justify-center mb-4 text-center text-primary-700 text-blue-600 font-inter text-4xl font-bold leading-10 ">
							Congratulations!
						</div>

						<div className="mt-16 flex justify-center text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="99"
								height="99"
								viewBox="0 0 99 99"
								fill="none"
							>
								<path
									d="M49.0889 0C42.6424 -9.6864e-08 36.2591 1.28035 30.3034 3.76796C24.3476 6.25557 18.9361 9.90171 14.3778 14.4982C9.81948 19.0947 6.20361 24.5516 3.73667 30.5572C1.26972 36.5628 0 42.9996 0 49.5C0 56.0004 1.26972 62.4372 3.73667 68.4428C6.20361 74.4484 9.81948 79.9053 14.3778 84.5018C18.9361 89.0983 24.3476 92.7444 30.3034 95.232C36.2591 97.7197 42.6424 99 49.0889 99C55.5353 99 61.9186 97.7197 67.8744 95.232C73.8301 92.7444 79.2416 89.0983 83.7999 84.5018C88.3583 79.9053 91.9741 74.4484 94.4411 68.4428C96.908 62.4372 98.1777 56.0004 98.1777 49.5C98.1777 42.9996 96.908 36.5628 94.4411 30.5572C91.9741 24.5516 88.3583 19.0947 83.7999 14.4982C79.2416 9.90171 73.8301 6.25557 67.8744 3.76796C61.9186 1.28035 55.5353 -9.6864e-08 49.0889 0Z"
									fill="#14BD5A"
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M80.4367 34.3527C81.1905 35.2635 81.0662 36.6202 80.1593 37.3831L41.4011 69.9827C40.9543 70.3585 40.3754 70.5353 39.798 70.4722C39.2206 70.4091 38.6946 70.1116 38.3412 69.6483L21.7122 47.8438C20.9951 46.9034 21.1726 45.5525 22.1088 44.8264C23.045 44.1003 24.3853 44.274 25.1025 45.2143L40.3804 65.2472L77.4297 34.0849C78.3367 33.322 79.683 33.4419 80.4367 34.3527Z"
									fill="white"
								/>
							</svg>
						</div>
						<p className="text-gray-500 mt-6 font-inter text-base font-medium leading-5 flex w-84 h-5.061 flex-col justify-center items-center flex-shrink-0">
							Passkey created successfully
						</p>

						<div className="mt-20">
							<Button
								type="submit"
								onClick={redirectSignInPage}
								className="w-full font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 30 20"
									fill="none"
								>
									<path
										d="M29.8369 10.763C29.9991 10.3984 30.0415 9.99721 29.9588 9.61015C29.876 9.22309 29.6717 8.86759 29.3719 8.58861L20.7999 0.609018C20.6022 0.418485 20.3657 0.26651 20.1043 0.161959C19.8428 0.0574089 19.5616 0.00237707 19.2771 7.53215e-05C18.9925 -0.00222642 18.7103 0.0482475 18.447 0.148553C18.1836 0.248858 17.9443 0.396985 17.7431 0.584292C17.5419 0.771598 17.3828 0.994332 17.275 1.2395C17.1673 1.48466 17.1131 1.74735 17.1155 2.01223C17.118 2.27711 17.1771 2.53888 17.2894 2.78227C17.4018 3.02566 17.565 3.24578 17.7697 3.4298L22.6857 8.0061H2.14299C1.57464 8.0061 1.02956 8.21628 0.627668 8.59039C0.225779 8.96451 0 9.47192 0 10.001C0 10.5301 0.225779 11.0375 0.627668 11.4116C1.02956 11.7857 1.57464 11.9959 2.14299 11.9959H22.6857L17.7718 16.5702C17.5672 16.7542 17.4039 16.9743 17.2916 17.2177C17.1793 17.4611 17.1202 17.7229 17.1177 17.9878C17.1152 18.2526 17.1694 18.5153 17.2772 18.7605C17.3849 19.0057 17.5441 19.2284 17.7453 19.4157C17.9465 19.603 18.1858 19.7511 18.4491 19.8514C18.7125 19.9518 18.9947 20.0022 19.2792 19.9999C19.5638 19.9976 19.845 19.9426 20.1064 19.838C20.3679 19.7335 20.6043 19.5815 20.802 19.391L29.374 11.4114C29.5725 11.2257 29.7298 11.0054 29.8369 10.763Z"
										fill="white"
									/>
								</svg>
								<span className="ml-2">Continue</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
			<FooterBar />
		</div>
	);
};

export default RegistrationSuccess;
