import { assert } from '@sprucelabs/test-utils'
import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.login()
    await run.run()
})()

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        const { date } = await this.addJobAsProcessor()

        await this.clickNav('processor')
        await this.clickTab('calendar')

        await this.runner.hoverOver(`[data-date="${date}"]`)
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
