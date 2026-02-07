import { Tooltip } from '@mantine/core'
import { BuildingsIcon } from '@phosphor-icons/react/Buildings'
import { DiceFiveIcon } from '@phosphor-icons/react/DiceFive'
import { DiceFourIcon } from '@phosphor-icons/react/DiceFour'
import { DiceOneIcon } from '@phosphor-icons/react/DiceOne'
import { DiceSixIcon } from '@phosphor-icons/react/DiceSix'
import { DiceThreeIcon } from '@phosphor-icons/react/DiceThree'
import { DiceTwoIcon } from '@phosphor-icons/react/DiceTwo'
import { GearIcon } from '@phosphor-icons/react/Gear'
import { observer } from 'mobx-react'
import { useState } from 'react'
import { createUseStyles } from 'react-jss'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        padding: '0 4px 0 8px',
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
        <DiceOneIcon size={32} weight="duotone" key="one" className="dice" />,
        <DiceTwoIcon size={32} weight="duotone" key="two" className="dice" />,
        <DiceThreeIcon size={32} weight="duotone" key="three" className="dice" />,
        <DiceFourIcon size={32} weight="duotone" key="four" className="dice" />,
        <DiceFiveIcon size={32} weight="duotone" key="five" className="dice" />,
        <DiceSixIcon size={32} weight="duotone" key="six" className="dice" />,
    ]

    return (
        <div className={classes.container}>
            {contours.areProcessing ? (
                <Tooltip label="Generating contours...">
                    <GearIcon size={32} weight="duotone" className={classes.gear} />
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
                        <BuildingsIcon size={32} weight="duotone" className="city" />
                    </div>
                </Tooltip>
            )}
        </div>
    )
})
