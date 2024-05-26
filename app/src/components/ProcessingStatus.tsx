import { Buildings } from '@phosphor-icons/react/Buildings'
import { DiceThree } from '@phosphor-icons/react/DiceThree'
import { Gear } from '@phosphor-icons/react/Gear'
import { Tooltip } from '@mantine/core'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        padding: '0 8px',
    },
    gear: {
        animation: 'spin 5s linear infinite',
    },
    icon: {
        '& .dice': {
            display: 'none',
        },
        '& .city': {
            display: 'inline-block',
        },
        '&:hover': {
            '& .dice': {
                display: 'inline-block',
            },
            '& .city': {
                display: 'none',
            },
            cursor: 'pointer',
        },
    },
})

export const ProcessingStatus = observer(() => {
    const { contours } = useStores()
    const classes = useStyles()

    return (
        <div className={classes.container}>
            {contours.areProcessing ? (
                <Tooltip label="Generating contours...">
                    <Gear size={28} weight="duotone" className={classes.gear} />
                </Tooltip>
            ) : (
                <Tooltip label="Randomize" className={classes.icon}>
                    <span onClick={() => contours.randomizeFeature()}>
                        <DiceThree size={28} weight="duotone" className="dice" />
                        <Buildings size={28} weight="duotone" className="city" />
                    </span>
                </Tooltip>
            )}
        </div>
    )
})
