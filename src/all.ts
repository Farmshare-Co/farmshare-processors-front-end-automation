import globby from '@sprucelabs/globby'
import { buildLog, diskUtil } from '@sprucelabs/spruce-skill-utils'
import Runner from './Runner/Runner'

void (async () => {
    const runner = await Runner.Runner()

    const cwd = process.cwd()
    const matches = await globby('build/tests/**/[0-9]*.js', {
        cwd,
    })

    let log = buildLog('All')

    for (const match of matches) {
        const prefix = match.split('/').pop()?.split('.')[0] ?? 'Unknown'
        log = log.buildLog(prefix)
        runner.setLogPrefix(prefix)

        const file = diskUtil.resolveFile(cwd, match)
        const { default: Run } = require(file as string)
        log.info(`Running ${match}`)
        try {
            const single = new Run(runner, prefix)
            await single.run()
            log.info(`Finished ${match}`)
        } catch (err) {
            debugger
            log.error(`Failed to run ${match}`)
            throw err
        }
    }

    await runner.shutdown()

    log.info('All tests passed!')
})()
