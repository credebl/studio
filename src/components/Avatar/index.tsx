import React, { useState } from 'react'

import Avatar from 'react-avatar'

type Props = {
    name?: string,
    textSizeRatio?: number,
    size?: string,
    src?: string,
    className?: string,
    props?: unknown,
    round?: boolean
}

interface ColorPair {
    text: string,
    background: string
}

const CustomAvatar = ({ name, size, src, textSizeRatio, className, round, ...props }: Props): JSX.Element => {
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
    const [randomColor] = useState<ColorPair>(avatarColorPairs[Math.floor(Math.random() * avatarColorPairs.length)])
    
    return (
        <Avatar
            className={className || ""}
            initials={name === undefined ? " " : name?.split(" ")}
            maxInitials={2}
            name={name === undefined ? " " : name}
            color={randomColor.background}
            fgColor={randomColor.text}
            size={size ? size : "38"}
            textSizeRatio={textSizeRatio ? textSizeRatio : 2.5}
            src={src === undefined ? '' : src}
            round={round || false}
            {...props} />
    )
}
export default React.memo(CustomAvatar)
