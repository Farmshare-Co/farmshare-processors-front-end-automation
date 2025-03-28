import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.login()
    await run.run()
    await runner.shutdown()
    console.log('TEST PASSED!')
})()

export default class Run extends AbstractSingleRun {
    public async run() {}
}
