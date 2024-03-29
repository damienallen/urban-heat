import { createUseStyles } from 'react-jss'

const strokeWidth = '0.03em'
const strokeColor = 'rgba(216, 64, 0, 0.6)'
const titleColor = '#fff'

const useStyles = createUseStyles({
    container: {
        flex: 0,
        userSelect: 'none',
        zIndex: 500,
        margin: 16,
        '@media (max-width: 720px)': {
            background: 'rgba(255, 255, 255, 0.6)',
            width: '100%',
            margin: 0,
            padding: 8,
            textAlign: 'center',
        },
    },
    title: {
        fontSize: 42,
        fontWeight: 700,
        fontFamily: '"Courier Prime", monospace',
        fontOpticalSizing: 'auto',
        fontVariationSettings: '"MONO" 1',
        lineHeight: '0.9em',
        textTransform: 'uppercase',
        color: titleColor,
        '-webkit-text-stroke': `${strokeWidth} ${strokeColor}`,
        '@media (max-width: 720px)': { fontSize: 32 },
    },
    hiddenMobile: {
        '@media (max-width: 720px)': { display: 'none' },
    },
})

export const Title = () => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <div className={classes.title}>
                Urban <br className={classes.hiddenMobile} />
                Heat
            </div>
        </div>
    )
}
