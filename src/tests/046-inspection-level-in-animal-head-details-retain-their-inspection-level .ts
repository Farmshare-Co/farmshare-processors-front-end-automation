import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.clickNav('processor')
        await this.clickTab('settings')
        await this.runner.click('.btn-species_inspection')
        await this.toggleChips(['usda'], ['exempt', 'state'])

        for (let weekDay = 0; weekDay < 7; weekDay++) {
            await this.runner.setInputValue(
                `.capacitySettings-${weekDay}-dailyCapacities-0-capacities-1-value input`,
                '1'
            )
        }

        await wait(3000)

        await this.clickSubmit()
        await this.addJobAsProcessor({
            inspection: 'usda',
            splitType: 'whole',
        })

        await wait(1000)
        await this.clickTab('heads')

        await wait(500)
        await this.runner.click('.animal-heads-list tr a')

        await wait(500)

        await this.runner.click('.btn-edit-head-details')

        const results = await this.runner.getValue('[name="inspectionLevel"]')

        assert.isEqual(results, 'usda')
    }
}
