import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.clickTab('add-job')
        await this.addJobAsProcessor()
        await this.runner.setInputValue('job-status', 'Killed')
        await this.setInputValue('animalHeads.0.hangingWeight', '1000')
        await this.clickSaveInDialog()
        await this.clickSaveInDialog()

        await this.assertStatusEquals('Killed')

        await this.runner.setInputValue('job-status', 'Aging')

        await this.assertStatusEquals('Aging')
    }

    private async assertStatusEquals(expected: string) {
        const actual = await this.runner.getValue('select')
        assert.isEqual(actual, expected)
    }
}
