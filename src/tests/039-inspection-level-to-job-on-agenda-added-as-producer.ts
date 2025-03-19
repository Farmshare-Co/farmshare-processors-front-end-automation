import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun, AddJobAsProducerOptions } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        //logout
        await wait(4000)
        await this.runner.click('.dropdown-toggle')
        await wait(4000)
        await this.runner.clickAtIndex('.dropdown-item', 1)
        await wait(4000)

        await this.addJobAsProducerAndAssertIfIsInPendingApproval('exempt')

        //logout
        await wait(4000)
        await this.runner.click('.dropdown-toggle')
        await wait(4000)
        await this.runner.clickAtIndex('.dropdown-item', 1)
        await wait(4000)

        await this.addJobAsProducerAndAssertIfIsInPendingApproval('usda')
    }

    private async addJobAsProducerAndAssertIfIsInPendingApproval(
        inspection: string
    ) {
        const expectedFarmerData: AddJobAsProducerOptions = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoefarm@gmail.com',
            phone: '999-999-1234',
            farmName: "Jonh's Farm",
            inspection,
            hideZip: true,
        }

        const { id } = await this.addJobAsProducer(expectedFarmerData)

        await wait(4000)

        await this.runner.clickAtIndex('[type="button"]', 1)

        await this.login()

        await wait(4000)

        const maxAttempts = 50 // Limite de tentativas (ajuste conforme necessário)
        let attempts = 0

        while ((await this.runner.get(`[data-id="${id}"]`)) === null) {
            if (attempts >= maxAttempts) {
                throw new Error(
                    `Elemento com data-id="${id}" não encontrado após ${maxAttempts} tentativas.`
                )
            }

            await wait(100)
            await this.runner.clickAtIndex('.page-link [aria-hidden="true"]', 2)
            attempts++
        }

        const innerText = await this.runner.getInnerText(
            `[href="/processing-job/${id}"]`
        )

        assert.isTrue(innerText?.toLowerCase().includes(`${inspection} beef`))
    }
}
