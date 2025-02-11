import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.login()

        await this.addJobAsProcessor({
            totalHeads: 2,
        })

        await this.clickAnimalHeadInJobDetails(1)
        await this.clickEditOnFirstCutsheetOnAnimalDetails()
        const cutsheetName = await this.getFirstCutsheetsNameInCutsheetDetails()

        await this.clickAddFirstCutsheetToCartOnCutsheetDetails()
        await this.clickCheckboxesForAllSplitsInCutsheetDetailsDialog()
        await this.clickSaveInDialog()
        await this.clickSubmit()

        await this.clickAnimalHeadInJobDetails(0)

        const actualCutsheetName =
            await this.getFirstCutsheetNameOnAnimalDetails()

        assert.isEqual(
            cutsheetName,
            actualCutsheetName,
            'Cutsheet name did not save'
        )
    }
}
