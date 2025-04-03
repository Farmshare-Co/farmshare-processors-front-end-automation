import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()

        await this.setDepositAndVerify('0')
        await this.navigateToAgenda()

        const inspections = ['Exempt', 'USDA', false]

        for (const inspection of inspections) {
            await this.declineAllJobsNeedingApproval()

            const { id } = await this.addJobAsProducer({
                inspection:
                    typeof inspection === 'string'
                        ? inspection.toLowerCase()
                        : false,
                hasDeposit: false,
            })

            assert.isTruthy(id, 'Failed get job id')

            await this.runner.close()
            await this.refreshAndWaitForLoad()

            await this.navigateToAgenda()

            const texts = await this.runner.getInnerTextAll(
                `[data-id="${id}"] td a`
            )

            for (const text of texts) {
                assert.isEqual(
                    text,
                    `1${inspection ? ` ${inspection}` : ``} Beef`,
                    'Did not drop in exemption to job row'
                )
            }
        }
    }
}
