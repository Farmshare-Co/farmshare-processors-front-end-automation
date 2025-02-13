import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.declineAllJobsNeedingApproval()

        const { date: dropoffDate } = await this.addJobAsProcessor()

        await this.clickAnimalHeadInJobDetails()

        await this.runner.click('.btn-edit-head-details')

        const { inputFormat: killDate, isoFormat: killDateCalendar } =
            this.addDays(dropoffDate, 1)
        const { inputFormat: cutDate } = this.addDays(dropoffDate, 2)

        await this.setInputValue('killDate', killDate)
        await this.setInputValue('cutDate', cutDate)

        await this.clickSaveInDialog()

        await this.clickNav('processor')
        await this.clickTab('calendar')

        await this.runner.click('.btn-harvest')
        await this.runner.click('.btn-cut')

        await this.runner.dragAndDrop(
            `[data-date="${dropoffDate}"] .fc-event-draggable`,
            `[data-date="${killDateCalendar}"]`
        )

        await this.clickSaveInDialog()

        // everything should be adjusted by one day
        await this.assertDayInCalendarIncludesEventAtStage(
            this.addDays(dropoffDate, 1).isoFormat,
            'Drop-off'
        )

        await this.assertDayInCalendarIncludesEventAtStage(
            this.addDays(dropoffDate, 2).isoFormat,
            'Harvest'
        )

        await this.assertDayInCalendarIncludesEventAtStage(
            this.addDays(dropoffDate, 3).isoFormat,
            'Cut'
        )
    }
}
