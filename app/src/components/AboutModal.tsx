import { Modal } from '@mantine/core'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        background: 'hotPink',
    },
})

export const AboutModal = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    return ui.showAbout ? (
        <div className={classes.container}>
            <Modal
                opened={ui.showAbout}
                onClose={() => ui.toggleShowAbout()}
                title={<h4>About Urban Heat Map</h4>}
                centered
            >
                <p></p>
                <p>
                    This project is developed by{' '}
                    <a href="https://dallen.co" target="_blank">
                        Damien Allen
                    </a>
                    .
                </p>
            </Modal>
        </div>
    ) : null
})
