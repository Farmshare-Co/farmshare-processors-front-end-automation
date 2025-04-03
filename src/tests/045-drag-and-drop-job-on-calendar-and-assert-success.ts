import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.navigateToAddJob()

        const { date } = await this.addJob({
            phone: '',
        })

        await this.navigateToCalendar()

        const { isoFormat } = await this.addDays(date, 1)
        await this.runner.dragAndDrop(
            `[data-date="${date}"] .fc-event-draggable`,
            `[data-date="${isoFormat}"]`
        )

        await this.clickSubmit()

        await wait(100)

        await this.assertSuccessfulAction()
    }
}
