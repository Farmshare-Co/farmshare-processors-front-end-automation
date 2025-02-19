import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.clickTab('calendar')

        const today = new Date()
        const { isoFormat } = this.addDays(today, 1)
        await this.runner.hoverOver(`[data-date="${isoFormat}"]`)
        await this.runner.click(`[data-date="${isoFormat}"] .cell-agenda-link`)

        await this.runner.click('.offcanvas-body .sticky-bottom button')

        const value = await this.runner.getValue('[name="dates.start"]')

        assert.isEqual(
            value,
            isoFormat,
            'Did not set correct date scheduled when adding job from calendar agenda view'
        )
    }
}
