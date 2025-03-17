import { assert } from '@sprucelabs/test-utils'
import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'
import wait from './Runner/wait'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.login()
    await run.run()
    await runner.shutdown()
})()

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.clickNav('processor')
        await this.clickTab('calendar')
        const today = new Date()
        const { isoFormat } = this.addDays(today, 1)
        await this.hoverOverCalendarDay(isoFormat)
        await this.clickDaysAgendaInCalendarDay(isoFormat)
        await this.clickNewJobInDaysAgenda()
        await this.addJob()
    }
}
