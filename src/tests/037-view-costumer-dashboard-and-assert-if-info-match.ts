import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun, AddJobAsProducerOptions } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.clickNav('processor')
        await this.clickTab('add-job')

        const expectedFarmerData: AddJobAsProducerOptions = {
            firstName: process.env.CUSTOMER_2_FIRST ?? 'John',
            lastName: process.env.CUSTOMER_2_LAST ?? 'Doe',
            email: process.env.CUSTOMER_2_EMAIL ?? 'johndoefarm@gmail.com',
            phone: process.env.CUSTOMER_2_PHONE ?? '999-999-1234',
            farmName: process.env.CUSTOMER_2_FARM ?? "Jonh's Farm",
            zip: process.env.CUSTOMER_2_ZIP ?? '90210',
        }

        await this.addJob(expectedFarmerData)

        await this.clickNav('processor')
        await this.clickTab('customers')

        await this.runner.setInputValue(
            '.search-input',
            expectedFarmerData.firstName + ' ' + expectedFarmerData.lastName
        )

        await wait(1000)
        await this.runner.click('tr a')

        const name = await this.runner.getInnerText('.costumer-name')
        const email = await this.runner.getInnerText('.costumer-email')

        assert.isEqual(
            name,
            expectedFarmerData.firstName + ' ' + expectedFarmerData.lastName
        )
        assert.isEqual(email, expectedFarmerData.email)

        await wait(3000)
    }
}
