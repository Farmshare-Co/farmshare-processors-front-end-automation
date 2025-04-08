import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        const { id } = await this.addJobAsProcessor()

        await wait(5000)
        const url = this.runner.getCurrentUrl()
        assert.doesInclude(url, `/processing-job/${id}`)
    }
}
