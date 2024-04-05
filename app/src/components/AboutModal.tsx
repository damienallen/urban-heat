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
    const { ui } = useStores()
    const classes = useStyles()

    return ui.showAbout ? (
        <Modal
            className={classes.container}
            opened={ui.showAbout}
            onClose={() => ui.toggleShowAbout()}
            title={<span className={classes.title}>About the UHM App</span>}
            centered
        >
            <p>
                The Urban Heat Map aims to provide an easily interpreted visualization of the{' '}
                <a href="https://en.wikipedia.org/wiki/Urban_heat_island" rel="external">
                    Urban Heat Island Effect
                </a>{' '}
                using processed public satellite imagery.
            </p>
            <p>
                This web application borrows your hardware for efficiently generating and displaying
                isotherm contours. Thus, allowing for more interactivity, without high hosting
                costs.
            </p>
            <p>
                A project by{' '}
                <a href="https://dallen.co" rel="author" target="_blank">
                    Damien Allen
                </a>
                .
            </p>
        </Modal>
    ) : null
})
