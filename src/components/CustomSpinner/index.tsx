import { Spinner } from 'flowbite-react';

interface SpinnerProps {
    color?: 'info' | 'success' | 'failure' | 'warning' | 'pink' | 'purple' 
    message?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const CustomSpinner = ({color, message, size}: SpinnerProps) => {

    return (
        <span>
            <Spinner
                className='mr-2'
                color= {color ? color : 'info'}
                size={size ? size : 'md' }

            />
            {message ? message : ' Loading...'}
           
        </span>
    )

}

export default CustomSpinner