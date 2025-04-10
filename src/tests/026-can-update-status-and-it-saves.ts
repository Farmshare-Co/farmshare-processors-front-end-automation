import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.declineAllJobsNeedingApproval()
        await this.deleteAllJobsInProgress()
        await this.addJobAsProcessor()
        await this.runner.setInputValue('[name="job-status"]', 'Killed')
        await this.setInputValue('animalHeads.0.hangingWeight', '1000')
        await this.clickSaveInDialog()
        await this.clickSaveInDialog()

        await wait(3000)

        await this.assertStatusEquals('Killed')

        await this.runner.setInputValue('[name="job-status"]', 'Aging')

        await wait(3000)

        await this.assertStatusEquals('Aging')
    }

    private async assertStatusEquals(expected: string) {
        const actual = await this.runner.getValue('select')
        assert.isEqual(actual, expected)
    }
}
