import { Menu } from '@mantine/core'
import { StackSimple } from '@phosphor-icons/react/StackSimple'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    icon: {
        margin: '0 8px',
        flex: 0,
        display: 'flex',
        cursor: 'pointer',
    },
    disabled: {
        cursor: 'not-allowed',
        opacity: 0.5,
    },
    menuItem: {
        textAlign: 'center',
    },
})

export const StyleMenu = observer(() => {
    const { app, contours } = useStores()
    const classes = useStyles()

    const stylesList: { label: string; value: string }[] = [
        {
            label: 'Basic',
            value: 'basic-v2',
        },
        {
            label: 'Dataviz',
            value: 'dataviz',
        },
        {
            label: 'Bright',
            value: 'bright-v2',
        },
        {
            label: 'Satellite',
            value: 'satellite',
        },
        {
            label: 'Streets',
            value: 'streets-v2',
        },
        {
            label: 'Topo',
            value: 'topo-v2',
        },
    ]

    const styleElementsList = stylesList.map((item) => (
        <Menu.Item
            component="span"
            key={`style-${item.value}`}
            onClick={() => app.setMapStyle(item.value)}
            className={classes.menuItem}
        >
            {item.value == app.mapStyle ? <b>{item.label}</b> : item.label}
        </Menu.Item>
    ))

    return (
        <Menu
            shadow="sm"
            position="bottom"
            offset={0}
            withArrow
            arrowPosition="center"
            disabled={contours.areProcessing}
        >
            <Menu.Target>
                <span
                    className={`${classes.icon} ${contours.areProcessing ? classes.disabled : ''}`}
                >
                    <StackSimple size={32} weight="duotone" />
                </span>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>Maptiler Styles</Menu.Label>
                {...styleElementsList}
            </Menu.Dropdown>
        </Menu>
    )
})
