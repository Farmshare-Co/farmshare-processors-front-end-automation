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
        await this.deleteAllJobsInProgress()
        const { id } = await this.addJobAsProcessor()

        await this.clickNav('processor')

        const status = 'Dropped_Off'

        const statusSeletor = `[data-id="${id}"] select`
        await this.selectValue(statusSeletor, status)

        await this.setInputValue('animalHeads.0.liveWeight', '500')

        await this.clickSaveInDialog()

        await this.assertInputValueEquals(statusSeletor, status)

        await this.runner.refresh()

        await this.assertInputValueEquals(statusSeletor, status)
    }
}
