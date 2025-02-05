import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.run()
})()

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.login()
        await this.clickTab('settings')
    }
}
