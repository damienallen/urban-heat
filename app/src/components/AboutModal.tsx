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
    },
    title: {
        fontWeight: 'bold',
    },
})

export const AboutModal = observer(() => {
    const { app, ui } = useStores()
    const classes = useStyles()

    return ui.showAbout ? (
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
                across a number of urban centers.
            </p>
            <p>
                Your device's CPU and GPU are used to efficiently generate and display isotherm
                contours using a moderate resolution satellite image source.
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
    ) : null
})
