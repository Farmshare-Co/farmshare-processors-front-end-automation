import { assert } from '@sprucelabs/test-utils'
import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'
import wait from './Runner/wait'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.login()
    await run.run()
    await runner.shutdown()
})()

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
