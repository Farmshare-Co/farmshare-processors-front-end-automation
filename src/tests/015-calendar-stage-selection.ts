import { AbstractSingleRun } from '../Runner/SingleRun'

//did not work
export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        debugger
        await this.deleteAllJobsInProgress()
        const { date: dropoffDate } = await this.addJobAsProcessor()
        await this.clickAnimalHeadInJobDetails()
        await this.runner.click('.btn-edit-head-details')
        const { inputFormat: killDate, isoFormat: killDateCalendar } =
            this.addDays(dropoffDate, 1)
        const { inputFormat: cutDate, isoFormat: cutDateCalendar } =
            this.addDays(dropoffDate, 2)
        await this.setInputValue('killDate', killDate)
        await this.setInputValue('cutDate', cutDate)
        await this.clickSaveInDialog()
        await this.navigateToCalendar()
        await this.assertDayInCalendarIncludesEventAtStage(
            dropoffDate,
            'Drop-off'
        )
        await this.runner.click('.btn-drop-off')
        await this.assertDayInCalendarDoesNotIncludeEventAtStage(
            dropoffDate,
            'Drop-off'
        )
        await this.runner.click('.btn-harvest')
        await this.assertDayInCalendarIncludesEventAtStage(
            killDateCalendar,
            'Harvest'
        )
        await this.runner.click('.btn-harvest')
        await this.assertDayInCalendarDoesNotIncludeEventAtStage(
            killDateCalendar,
            'Harvest'
        )
        await this.runner.click('.btn-cut')
        await this.assertDayInCalendarIncludesEventAtStage(
            cutDateCalendar,
            'Cut'
        )
        await this.runner.click('.btn-cut')
        await this.assertDayInCalendarDoesNotIncludeEventAtStage(
            cutDateCalendar,
            'Cut'
        )
    }
}
