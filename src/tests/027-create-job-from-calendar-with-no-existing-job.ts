import { AbstractSingleRun } from '../Runner/SingleRun'

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
