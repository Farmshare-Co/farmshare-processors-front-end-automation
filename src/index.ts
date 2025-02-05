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
        await this.setDepositAndVerify('100')
        await this.setDepositAndVerify('0')
    }

    private async setDepositAndVerify(value: string) {
        await this.runner.setInputValue('[name="schedulingDeposit"]', value)
        await this.clickSubmit()
        await this.runner.refresh()
        await this.assertValueEquals('[name="schedulingDeposit"]', value)
    }
}
