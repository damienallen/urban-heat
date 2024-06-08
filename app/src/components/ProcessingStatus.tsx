import { Buildings } from '@phosphor-icons/react/Buildings'
import { DiceFive } from '@phosphor-icons/react/DiceFive'
import { DiceFour } from '@phosphor-icons/react/DiceFour'
import { DiceOne } from '@phosphor-icons/react/DiceOne'
import { DiceSix } from '@phosphor-icons/react/DiceSix'
import { DiceThree } from '@phosphor-icons/react/DiceThree'
import { DiceTwo } from '@phosphor-icons/react/DiceTwo'
import { Gear } from '@phosphor-icons/react/Gear'
import { Tooltip } from '@mantine/core'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useState } from 'react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        paddingLeft: '0 4px 0 8px',
    },
    gear: {
        animation: 'spin 5s linear infinite',
    },
    button: {
        '& .dice': {
            display: 'none',
        },
        '& .city': {
            display: 'flex',
        },
        '&:hover': {
            '& .dice': {
                display: 'flex',
            },
            '& .city': {
                display: 'none',
            },
            cursor: 'pointer',
        },
    },
})

const getRoll = () => Math.floor(Math.random() * 6)

export const ProcessingStatus = observer(() => {
    const { contours } = useStores()
    const classes = useStyles()

    const [roll, setRoll] = useState<number>(getRoll)
    const dice = [
        <DiceOne size={32} weight="duotone" className="dice" />,
        <DiceTwo size={32} weight="duotone" className="dice" />,
        <DiceThree size={32} weight="duotone" className="dice" />,
        <DiceFour size={32} weight="duotone" className="dice" />,
        <DiceFive size={32} weight="duotone" className="dice" />,
        <DiceSix size={32} weight="duotone" className="dice" />,
    ]

    return (
        <div className={classes.container}>
            {contours.areProcessing ? (
                <Tooltip label="Generating contours...">
                    <Gear size={32} weight="duotone" className={classes.gear} />
                </Tooltip>
            ) : (
                <Tooltip label="Randomize">
                    <div
                        onMouseLeave={() => setRoll(getRoll())}
                        onClick={() => {
                            contours.randomizeFeature()
                            setRoll(getRoll())
                        }}
                        className={classes.button}
                    >
                        {dice[roll]}
                        <Buildings size={32} weight="duotone" className="city" />
                    </div>
                </Tooltip>
            )}
        </div>
    )
})
