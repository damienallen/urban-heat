import { Modal, Pill } from '@mantine/core'

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
            title={
                <span className={classes.title}>
                    About the Project <Pill>v{app.version}</Pill>
                </span>
            }
            centered
        >
            <p>
                This app aims to provide a convenient visualization of the{' '}
                <a href="https://en.wikipedia.org/wiki/Urban_heat_island" rel="external">
                    Urban Heat Island Effect
                </a>{' '}
                across European urban centers.
            </p>
            <p>
                Due to limitations in available processing power and hosting costs, this project is
                limited to cities included in the{' '}
                <a
                    href="https://ec.europa.eu/eurostat/web/gisco/geodata/statistical-units/urban-audit"
                    rel="external"
                >
                    Eurostat GISCO Urban Audit
                </a>{' '}
                (2021).
            </p>
            <br />
            <p>
                Isotherm contour polygons are generated from a moderate resolution satellite image
                source using client-side worker processes.
            </p>
            <br />
            <p>
                Questions & comments are welcome:{' '}
                <a href="mailto:mail@urbanheat.app">mail@urbanheat.app</a>
            </p>
            <br />
            <p>
                Created by{' '}
                <a href="https://dallen.co" rel="author" target="_blank">
                    Damien Allen
                </a>
            </p>
        </Modal>
    )
})
