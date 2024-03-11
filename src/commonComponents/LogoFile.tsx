
import { envConfig } from '../config/envConfig';

const LogoFile = () => {
    return (
		<>
		<img
		src={envConfig.PLATFORM_DATA.logo}
		className="h-8 mr-3"
		alt={`${envConfig.PLATFORM_DATA.name} logo`}
	/>
	<span
		className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white"
		>{envConfig.PLATFORM_DATA.name}</span>
		</>
        
    )
}

export default LogoFile;