import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.declineAllJobsNeedingApproval()

        await wait(5000)

        const inspections = ['Exempt', 'USDA']

        for (const inspection of inspections) {
            await this.deleteAllJobsInProgress()

            const { id } = await this.addJobAsProcessor({
                inspection: inspection.toLowerCase(),
            })

            await this.navigateToAgenda()

            const texts = await this.runner.getInnerTextAll(
                `[data-id="${id}"] td a`
            )

            for (const text of texts) {
                assert.isEqual(
                    text,
                    `1 ${inspection} Beef`,
                    'Did not drop in exemption to job row'
                )
            }
        }
    }
}
