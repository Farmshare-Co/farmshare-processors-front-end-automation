import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await wait(3000)
        await this.declineAllJobsNeedingApproval()
        await this.addJobAsProducerAndAssertIfIsInPendingApproval('exempt')
        await this.addJobAsProducerAndAssertIfIsInPendingApproval('usda')
    }

    private async addJobAsProducerAndAssertIfIsInPendingApproval(
        inspection: string
    ) {
        const { id } = await this.addJobAsProducer({
            firstName: process.env.CUSTOMER_2_FIRST ?? 'John',
            lastName: process.env.CUSTOMER_2_LAST ?? 'Doe',
            email: process.env.CUSTOMER_2_EMAIL ?? 'johndoefarm@gmail.com',
            phone: process.env.CUSTOMER_2_PHONE ?? '999-999-1234',
            farmName: process.env.CUSTOMER_2_FARM ?? "Jonh's Farm",
            zip: process.env.CUSTOMER_2_ZIP ?? '90210',
            inspection,
        })

        await this.runner.close()
        await this.runner.refresh()

        const innerText = await this.runner.getInnerText(`[data-id="${id}"] a`)

        assert.isTrue(
            innerText?.toLowerCase().includes(`${inspection} beef`),
            `Inspection level not found in pending aproval card`
        )
    }
}
