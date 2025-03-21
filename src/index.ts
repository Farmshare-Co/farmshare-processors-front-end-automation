import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'
import wait from './Runner/wait'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.login()
    await run.run()
    await runner.shutdown()
    console.log('TEST PASSED!')
})()

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.clickNav('processor')
        await this.clickTab('agenda')
        await this.scrollToBottomOfPage()
        await wait(3000)

        await this.runner.getProp('.notifications .card-bodysss', 'className')
    }
}
