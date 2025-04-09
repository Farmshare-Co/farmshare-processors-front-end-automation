import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.declineAllJobsNeedingApproval()
        await this.deleteAllJobsInProgress()
        await this.navigateToCalendar()
        await this.scheduleJobFromCalendar()
    }
}
