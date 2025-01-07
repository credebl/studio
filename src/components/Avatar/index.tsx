
import * as Avatar from '@radix-ui/react-avatar';

type Props = {
    name?: string,
    src?: string,
    textSizeRatio?: number
    className?: string,
    round?: boolean
    size?:string;
}

interface ColorPair {
    text: string,
    background: string
}

const avatarColorPairs: ColorPair[] = [
    {
        text: '#ea5455',
        background: '#fceaea'
    },
    {
        text: '#b8b2f7',
        background: '#eeecfe'
    },
    {
        text: '#c1c2c5',
        background: '#f0f0f1'
    },
    {
        text: '#82ddaa',
        background: '#e5f8ed'
    },
    {   
        text: '#f4a651',
        background: '#fdf3e8'
    },
    {
        text: '#76ddef',
        background: '#e0f9fd'
    }
]

const getColorPair = (name: string | undefined): ColorPair => {
    if (!name) return avatarColorPairs[0];
    const index = name
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColorPairs.length;
    return avatarColorPairs[index];
};

const CustomAvatar = ({ name, src, className, textSizeRatio = 2.5, round = false, size = '45px' }: Props): JSX.Element => {
    const colorPair = getColorPair(name);
    const fontSize = `calc(${size} / ${textSizeRatio})`;

    return (
        <Avatar.Root style={{
            height: size,
            width: size,
            borderRadius: round ? '0%' : '100%'
        }} className={`bg-blackA1 inline-flex h-[45px] w-[45px] select-none items-center justify-center overflow-hidden rounded-full align-middle`}>
            {src ? (
                <Avatar.Image
                    className={className}
                    src={src}
                    alt={name}
                />
            ) : (
                <Avatar.Fallback
                className={className}
                style={{ backgroundColor: colorPair.background, color: colorPair.text, fontSize, display:'flex', justifyContent:'center', alignItems:'center' }}
                >
                    {name?.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)}
                </Avatar.Fallback>
            )}
        </Avatar.Root>
    );
};

export default CustomAvatar;
