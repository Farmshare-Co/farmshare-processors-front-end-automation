import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

//did not work
export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.navigateToSettings()
        await this.toggleChips(
            ['beef'],
            ['hog', 'bison', 'lamb', 'goat', 'venison', 'yak']
        )

        const autoSchedulingIsEnabled = await this.runner.getProp(
            '[name="autoSchedulingSettings.0.isEnabled"]',
            'value'
        )

        if (autoSchedulingIsEnabled == 'false') {
            await this.runner.click(
                '[name="autoSchedulingSettings.0.isEnabled"]'
            )
        }

        await wait(3000)

        await this.runner.setInputValue('.harvest-date-day input', '1')

        await wait(3000)

        await this.runner.setInputValue('.cut-date-day input', '14')

        await wait(3000)

        await this.clickSubmit()

        await wait(3000)

        await this.navigateToAddJob()
        const { date } = await this.addJob()

        await this.clickTab('heads')

        await this.runner.click('tbody tr a')

        await this.runner.click('.btn-edit-head-details')

        const killDate = await this.runner.getValue('[name="killDate"]')
        const cutDate = await this.runner.getValue('[name="cutDate"]')

        const dayOfKillShouldBe = this.addDays(date, 1)
        const dayOfCutShouldBe = this.addDays(date, 14)

        assert.isEqual(killDate, dayOfKillShouldBe.yyyMmDd)
        assert.isEqual(cutDate, dayOfCutShouldBe.yyyMmDd)
    }
}
