import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'
import wait from './Runner/wait'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.login()
    await run.run()
    await runner.shutdown()
})()

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        debugger
        await this.runner.redirect('/admin/job-export')
        await wait(3000)
        await this.runner.clickAtIndex('button', 2)
        await this.runner.redirect('/processor')
    }
}
