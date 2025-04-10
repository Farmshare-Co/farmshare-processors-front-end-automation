import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

//did not work
export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.runner.redirect('/processor/agenda')
        await wait(1000)
        await this.deleteAllJobsInProgress()
        await this.declineAllJobsNeedingApproval()

        const { date } = await this.addJobAsProcessor()

        await this.navigateToCalendar()

        await this.runner.hoverOver(`[data-date="${date}"]`)
        await this.runner.hoverOver(`[data-date="${date}"] .cell-agenda-link`)
        await wait(1000)
        await this.runner.click(`[data-date="${date}"] .cell-agenda-link`)

        await this.runner.click('.offcanvas-body .sticky-bottom button')

        const value = await this.runner.getValue('[name="dates.start"]')

        assert.isEqual(
            value,
            date,
            'Did not set correct date scheduled when adding job from calendar agenda view'
        )
    }
}
