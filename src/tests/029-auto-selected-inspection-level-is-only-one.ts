import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.navigateToSettings()
        const usdaIsEnabled = await this.getIsChipSelected('usda')
        const exemptIsEnabled = await this.getIsChipSelected('exempt')
        const stateIsEnabled = await this.getIsChipSelected('state')

        if (!usdaIsEnabled) {
            await this.clickChip('usda')
        }
        if (exemptIsEnabled) {
            await this.clickChip('exempt')
        }
        if (stateIsEnabled) {
            await this.clickChip('state')
        }

        await this.clickSubmit()

        await this.navigateToAddJob()

        await this.fillOutAddJobForm({
            inspection: false,
        })

        const results = await this.runner.getValue(
            '[name="scheduledHeads[0].inspectionLevel"]'
        )

        assert.isEqual(
            results,
            'usda',
            `Did not auto-selected usda in add job form`
        )
    }
}
