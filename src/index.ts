import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.login()
    await run.run()
    await runner.shutdown()
})()

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        const dropoffDate = '2025-03-10'
        const killDateCalendar = '2025-03-11'

        await this.clickNav('processor')
        await this.clickTab('calendar')

        await this.runner.click('.btn-harvest')
        await this.runner.click('.btn-cut')

        await this.runner.dragAndDrop(
            `[data-date="${dropoffDate}"] .fc-event-draggable`,
            `[data-date="${killDateCalendar}"]`
        )

        debugger

        await this.clickSaveInDialog()
    }
}
