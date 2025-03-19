import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.clickNav('processor')
        await this.clickTab('add-job')

        await this.fillOutAddJobForm({
            firstName: 'Test',
            lastName: 'Farms',
            farmName: 'Test Farms',
            phone: '555-123-1234',
            email: 'testFarm@gmail.com',
            inspection: 'usda',
            totalHeads: 1,
        })

        await this.clickSubmit()

        await wait(1000)

        await this.clickNav('processor')
        await this.clickTab('agenda')

        const text = await this.runner.getInnerText('.needs-attention tr a')

        assert.isTrue(text?.toLowerCase().includes('usda'))

        await wait(1000)
    }
}
