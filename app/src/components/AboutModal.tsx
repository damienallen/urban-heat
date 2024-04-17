import { Modal } from '@mantine/core'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        fontSize: '0.9em',
        '& p': {
            margin: '16px 0 0 0',
        },
        '& .mantine-Modal-body': {
            marginTop: -8,
            marginBottom: 8,
        },
        '& .mantine-Modal-content': {
            padding: '0 8px',
        },
    },
    title: {
        fontWeight: 'bold',
    },
})

export const AboutModal = observer(() => {
    const { app, ui } = useStores()
    const classes = useStyles()

    return (
        <Modal
            className={classes.container}
            opened={ui.showAbout}
            onClose={() => ui.toggleShowAbout()}
            title={<span className={classes.title}>About the App</span>}
            centered
        >
            <p>
                This project aims to provide a convenient visualization of the{' '}
                <a href="https://en.wikipedia.org/wiki/Urban_heat_island" rel="external">
                    Urban Heat Island Effect
                </a>{' '}
                across European urban centers.
            </p>
            <p>
                Isotherm contours are generated from a moderate resolution satellite source using
                your device's CPU/GPU hardware.
            </p>
            <p>
                Created by{' '}
                <a href="https://dallen.co" rel="author" target="_blank">
                    Damien Allen
                </a>
                .
            </p>
            <p>
                <i>v{app.version}</i>
            </p>
        </Modal>
    )
})
