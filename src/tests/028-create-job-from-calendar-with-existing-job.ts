import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.clickNav('processor')
        await this.clickTab('calendar')
        await this.scheduleJobFromCalendar()
        await this.clickNav('processor')
        await this.clickTab('calendar')
        await this.scheduleJobFromCalendar()
    }
}
