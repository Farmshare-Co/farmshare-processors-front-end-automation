import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.clickNav('processor')
        await this.clickTab('add-job')

        await this.fillOutAddJobForm({
            inspection: 'usda',
        })

        await this.clickSubmit()

        await this.clickNav('processor')
        await this.clickTab('agenda')

        const text = await this.runner.getInnerText('.needs-attention tr a')

        assert.isTrue(text?.toLowerCase().includes('usda'))
    }
}
