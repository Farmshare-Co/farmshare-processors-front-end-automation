import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        const inspection = 'exempt'
        await this.addJobAsProcessor({
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
