import { useEffect, useState } from 'react';
import { ICheckEcosystem, checkEcosystem } from '../../config/ecosystem';
import { pathRoutes } from '../../config/pathRoutes';

const EcosystemSidebarOption = () => {
	const [isEcosystemEnabled, setIsEcosystemEnabled] = useState(false);

	useEffect(() => {
		const checkEcosystemData = async () => {
			const data: ICheckEcosystem = await checkEcosystem();
			setIsEcosystemEnabled(data.isEnabledEcosystem);
		};
		checkEcosystemData();
	}, []);

	if (isEcosystemEnabled) {
		return (
			<li>
				<a
					href={pathRoutes.ecosystem.root}
					className="flex items-center p-2 text-base text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="flex-shrink-0 w-6 h-6 pt-1 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
						width="24"
						height="24"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke="currentColor"
							stroke-width=".8"
							d="M7.113 12.626c.043.953.182 1.857.402 2.684a8.156 8.156 0 0 0-1.095.552 6.745 6.745 0 0 1-1.175-3.236h1.868Zm4.265-7.306v2.96a10.972 10.972 0 0 1-2.292-.356c.578-1.405 1.41-2.314 2.292-2.605ZM7.905 7.514a7.017 7.017 0 0 1-.675-.334c.415-.411.884-.77 1.394-1.063a8.1 8.1 0 0 0-.72 1.397Zm.713 10.372a6.825 6.825 0 0 1-1.387-1.06c.21-.12.435-.23.672-.333.203.506.443.974.715 1.393ZM12.623 5.32c.881.291 1.714 1.2 2.291 2.605-.71.193-1.485.315-2.291.356V5.32ZM9.086 16.08c.71-.194 1.486-.315 2.292-.357v2.962c-.881-.292-1.714-1.201-2.292-2.606Zm7.008.413c.239.104.464.215.675.334-.415.411-.883.77-1.394 1.063a8.1 8.1 0 0 0 .72-1.397Zm-.709-10.371c.507.292.973.65 1.387 1.059-.21.12-.435.23-.672.333a8.053 8.053 0 0 0-.715-1.392Zm-2.762 12.563v-2.962c.806.041 1.58.163 2.291.356-.577 1.405-1.41 2.314-2.291 2.606ZM11.38 9.526v1.858H8.354c.041-.81.16-1.578.341-2.279.839.233 1.745.377 2.683.42Zm7.374 3.097a6.745 6.745 0 0 1-1.175 3.238 8.138 8.138 0 0 0-1.095-.553c.222-.828.36-1.732.402-2.685h1.868ZM11.38 14.48a12.26 12.26 0 0 0-2.684.421 11.41 11.41 0 0 1-.34-2.278h3.023v1.857Zm-6.131-3.096a6.745 6.745 0 0 1 1.174-3.238c.34.207.708.39 1.096.552a12.54 12.54 0 0 0-.402 2.686H5.249Zm7.374 3.096v-1.857h3.024a11.46 11.46 0 0 1-.341 2.278 12.198 12.198 0 0 0-2.683-.42Zm4.267-3.099a12.707 12.707 0 0 0-.403-2.684 8.16 8.16 0 0 0 1.095-.552 6.745 6.745 0 0 1 1.175 3.236H16.89Zm-4.267.003V9.526a12.196 12.196 0 0 0 2.683-.42c.182.7.3 1.469.34 2.278h-3.023Z"
						/>
						<path
							fill="currentColor"
							d="M12 24.008c2.253 0 4.43-.63 6.327-1.811l-.321-.322A11.482 11.482 0 0 1 12 23.566C5.626 23.566.439 18.38.439 12.006c0-1.12.159-2.225.474-3.285a.22.22 0 0 0-.147-.274.218.218 0 0 0-.274.15A11.95 11.95 0 0 0 0 12.005c0 6.619 5.384 12.003 12.003 12.003H12ZM12.002.442c6.374 0 11.56 5.187 11.56 11.56 0 1.12-.158 2.225-.473 3.285a.22.22 0 0 0 .209.283.223.223 0 0 0 .212-.16c.327-1.098.492-2.246.492-3.407C24.002 5.384 18.617 0 11.999 0c-2.253 0-4.43.63-6.327 1.811l.32.322A11.482 11.482 0 0 1 12 .442h.003Zm-8.1.222L2.43 5.082 6.848 3.61 3.902.664Zm17.673 18.258-4.419 1.473 2.946 2.945 1.473-4.418Z"
						/>
					</svg>
					<span className="ml-3" sidebar-toggle-item>
						Ecosystems
					</span>
				</a>
			</li>
		);
	}

	return <></>;
};

export default EcosystemSidebarOption;
