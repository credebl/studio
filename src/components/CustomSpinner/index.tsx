
import {Spinner} from 'flowbite-react'
interface SpinnerProps {
    color?: 'info' | 'success' | 'failure' | 'warning' | 'pink' | 'purple' 
    message?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    hideMessage?: boolean
}

const CustomSpinner = ({color, message, size, hideMessage}: SpinnerProps) => (
    
        <span className='text-base font-normal text-gray-600 dark:text-gray-400'>
            <Spinner
                className='mr-2'
                color= {color ?? 'info'}
                size={size ?? 'md' }
                
            />
            
            {
                !hideMessage && <span>{message ?? ' Loading...'}</span>
            }
        </span>
        
    )

export default CustomSpinner