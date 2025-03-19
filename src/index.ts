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
        await this.deleteAllJobsInProgress()
        const inspection = 'exempt'
        await this.addJobAsProcessor({
            firstName: 'Test',
            lastName: 'Farms',
            farmName: 'Test Farms',
            phone: '555-123-1234',
            email: 'testFarm@gmail.com',
            inspection,
            totalHeads: 1,
        })

        const jobId = this.parseJobIdFromUrl()

        await this.clickNav('processor')
        await this.clickTab('calendar')

        const today = new Date()
        const { isoFormat } = this.addDays(today, 0)
        await this.hoverOverCalendarDay(isoFormat)
        await this.clickDaysAgendaInCalendarDay(isoFormat)
        await this.verifyInspectionLevelInList(jobId!, inspection, ['td', 'a'])
    }
}
