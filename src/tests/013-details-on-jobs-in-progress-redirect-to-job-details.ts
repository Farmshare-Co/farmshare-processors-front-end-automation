import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

// did not work
export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        debugger

        await this.deleteAllJobsInProgress()
        await this.addJobAsProcessor()

        await this.navigateToAgenda()

        await wait(2000)

        const firstRowDataId = await this.runner.getProp(
            '.in-progress tbody tr',
            'data-id'
        )

        await this.runner.click('.in-progress .btn-primary')

        const url = this.runner.getCurrentUrl()

        assert.doesInclude(url, `/processing-job/${firstRowDataId}`)
    }
}
