import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        const expectedFarmerData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoefarm@gmail.com',
            phone: '999-999-1234',
            farmName: "Jonh's Farm",
        }
        const { id } = await this.addJobAsProcessor(expectedFarmerData)

        await this.clickNav('processor')

        await wait(2000)

        await this.clickTab('jobs')

        await wait(2000)

        await this.runner.setInputValue(
            '[type="text"]',
            expectedFarmerData.firstName + ' ' + expectedFarmerData.lastName
        )

        await wait(2000)
        await this.runner.click(`[data-id="${id}"] a`)

        await wait(2000)

        await this.clickTab('cutsheets')

        await wait(2000)

        await this.runner.click(`.edit-all-cutsheets`)

        await wait(10000)

        await this.runner.click('.btn-add-to-cart')

        await wait(2000)

        await this.clickCheckboxesForAllSplitsInCutsheetDetailsDialog()

        await wait(2000)

        await this.clickSaveInDialog()

        await wait(2000)

        await this.clickSubmit()

        await wait(10000)

        await this.runner.setInputValue('[name="job-status"]', 'Invoicing')

        await wait(5000)

        await this.runner.setInputValue(
            '[id="floatingInput.animalHeads.0.liveWeight"]',
            '1000'
        )

        await this.runner.setInputValue(
            '[id="floatingInput.animalHeads.0.liveWeight"]',
            '1000'
        )

        await this.runner.setInputValue(
            '[id="floatingInput.animalHeads.0.hangingWeight"]',
            '750'
        )

        await wait(10000)

        await this.clickSaveInDialog()

        await wait(10000)

        const additionalCost = '100.00'
        const additionalCostReason = 'For cold storage'
        const additionalDetails = 'Additional details'

        await this.runner.setInputValue(
            '[id="form.animalHeads.0.additionalCost"]',
            additionalCost
        )

        await this.runner.setInputValue(
            '[id="form.animalHeads.0.additionalCostReason"]',
            additionalCostReason
        )

        await this.runner.setInputValue(
            '[id="form.additionalPickupDetails"]',
            additionalDetails
        )

        await wait(10000)

        await this.clickSaveInDialog()

        await wait(10000)

        const detailsText = await this.runner.getInnerText(
            '.invoice-additional-cost-details .value'
        )
        const addCostText = await this.runner.getInnerText(
            '.invoice-additional-cost .value span'
        )
        assert.isEqual(addCostText, `$${additionalCost}`)
        assert.isEqual(detailsText, additionalCostReason)
    }
}
