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
    console.log('TEST PASSED!')
})()

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.declineAllJobsNeedingApproval()
        await this.clickNav('processor')
        await this.clickTab('add-job')

        const addJobParams = {
            firstName: process.env.CUSTOMER_2_FIRST ?? 'John',
            lastName: process.env.CUSTOMER_2_LAST ?? 'Doe',
            email: process.env.CUSTOMER_2_EMAIL ?? 'test@gmail.com',
            farmName: process.env.CUSTOMER_2_FARM ?? "Jonh's Farm",
        }
        const { id } = await this.addJob(addJobParams)

        await wait(1000)

        await this.clickNav('processor')
        await this.clickTab('agenda')

        const text = await this.runner.getInnerText(
            `.needs-attention [data-id="${id}"]`
        )

        assert.isTrue(
            text?.includes(addJobParams.farmName),
            'Jobs needing attention do not include Farm name'
        )
    }
}
