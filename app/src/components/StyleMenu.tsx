import { Menu } from '@mantine/core'
import { StackSimple } from '@phosphor-icons/react'
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
})

export const StyleMenu = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    return (
        <Menu shadow="sm" position="bottom-end" offset={20} withArrow arrowPosition="center">
            <Menu.Target>
                <span className={classes.icon}>
                    <StackSimple size={32} weight="duotone" />
                </span>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>Maptiler Styles</Menu.Label>
                <Menu.Item>Settings</Menu.Item>
                <Menu.Item>Messages</Menu.Item>
                <Menu.Item>Gallery</Menu.Item>
                <Menu.Item>Search</Menu.Item>
            </Menu.Dropdown>
        </Menu>
    )
})
