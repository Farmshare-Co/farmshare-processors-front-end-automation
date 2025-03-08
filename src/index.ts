import { assert } from '@sprucelabs/test-utils'
import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.login()
    await run.run()
    await runner.shutdown()
})()

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.addJobAsProcessor()
        await this.runner.setInputValue('[name="job-status"]', 'Killed')
        await this.setInputValue('animalHeads.0.hangingWeight', '1000')
        await this.clickSaveInDialog()
        await this.clickSaveInDialog()

        await this.assertStatusEquals('Killed')

        await this.runner.setInputValue('[name="job-status"]', 'Aging')

        await this.assertStatusEquals('Aging')
    }

    private async assertStatusEquals(expected: string) {
        const actual = await this.runner.getValue('select')
        assert.isEqual(actual, expected)
    }
}
