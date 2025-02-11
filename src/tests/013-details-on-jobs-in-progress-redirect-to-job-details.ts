import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.login()

        await this.deleteAllJobsInProgress()
        await this.addJobAsProcessor()

        await this.clickNav('processor')

        const firstRowDataId = await this.runner.getProp(
            '.in-progress tbody tr',
            'data-id'
        )

        await this.runner.clickAtIndex('.in-progress .btn-primary', 0)

        const url = this.runner.getCurrentUrl()

        assert.doesInclude(url, `/processing-job/${firstRowDataId}`)
    }
}
