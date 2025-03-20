import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun, AddJobAsProducerOptions } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.clickNav('processor')
        await this.clickTab('add-job')

        const expectedFarmerData: AddJobAsProducerOptions = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'test@gmail.com',
            phone: '555-098-3212',
            farmName: 'Test Farms',
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
