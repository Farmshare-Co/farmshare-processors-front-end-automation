import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()

        await this.addJobAsProcessor({
            inspection: 'exempt',
            totalHeads: 1,
        })

        const exemptJobId = this.parseJobIdFromUrl()
        await this.navigateToJobs()
        await this.verifyInspectionLevelInList(exemptJobId!, 'exempt')

        await this.addJobAsProcessor({
            inspection: 'usda',
            totalHeads: 1,
        })

        const usdaJobId = this.parseJobIdFromUrl()
        await this.navigateToJobs()
        await this.verifyInspectionLevelInList(usdaJobId!, 'usda')
    }
}
