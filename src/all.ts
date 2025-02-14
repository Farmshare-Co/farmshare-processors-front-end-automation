import globby from '@sprucelabs/globby'
import { buildLog, diskUtil } from '@sprucelabs/spruce-skill-utils'
import Runner from './Runner/Runner'

void (async () => {
    const runner = await Runner.Runner()

    const cwd = process.cwd()
    const matches = await globby('build/tests/**/[0-9]*.js', {
        cwd,
    })

    const log = buildLog('All')

    for (const match of matches) {
        const file = diskUtil.resolveFile(cwd, match)
        const { default: Run } = require(file as string)
        log.info(`Running ${match}`)
        try {
            const single = new Run(runner)
            await single.run()
            log.info(`Finished ${match}`)
        } catch (err) {
            log.error(`Failed to run ${match}`)
            throw err
        }
    }

    await runner.shutdown()

    log.info('All tests passed!')
})()
