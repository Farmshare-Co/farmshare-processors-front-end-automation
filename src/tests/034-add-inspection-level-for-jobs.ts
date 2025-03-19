import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.addJobAsProcessor({
            firstName: 'Test',
            lastName: 'Farms',
            farmName: 'Test Farms',
            phone: '555-123-1234',
            email: 'testFarm@gmail.com',
            inspection: 'exempt',
            totalHeads: 1,
        })

        const exemptJobId = this.parseJobIdFromUrl()
        await this.clickNav('processor')
        await this.clickTab('jobs')
        await this.verifyInspectionLevelInList(exemptJobId!, 'exempt')

        await this.addJobAsProcessor({
            firstName: 'Test',
            lastName: 'Farms',
            farmName: 'Test Farms',
            phone: '555-123-1234',
            email: 'testFarm@gmail.com',
            inspection: 'usda',
            totalHeads: 1,
        })

        const usdaJobId = this.parseJobIdFromUrl()
        await this.clickNav('processor')
        await this.clickTab('jobs')
        await this.verifyInspectionLevelInList(usdaJobId!, 'usda')
    }
}
