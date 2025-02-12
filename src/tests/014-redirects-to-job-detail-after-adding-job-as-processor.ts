import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        const { id } = await this.addJobAsProcessor()

        const url = this.runner.getCurrentUrl()
        assert.doesInclude(url, `/processing-job/${id}`)
    }
}
