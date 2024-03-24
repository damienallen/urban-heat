import { createUseStyles } from 'react-jss'

const strokeWidth = '0.03em'
const strokeColor = 'rgba(216, 64, 0, 0.6)'
const titleColor = '#fff'

const useStyles = createUseStyles({
    container: {
        position: 'absolute',
        top: 16,
        left: 24,
        borderRadius: 16,
        userSelect: 'none',
        zIndex: 500,
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
    },
})

export const Title = () => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <div className={classes.title}>
                Urban
                <br />
                Heat
            </div>
        </div>
    )
}
