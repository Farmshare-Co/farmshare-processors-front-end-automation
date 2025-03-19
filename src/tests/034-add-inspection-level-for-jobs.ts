import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.clickNav('processor')
        await this.clickTab('add-job')

        await this.addJob({
            firstName: 'Test',
            lastName: 'Farms',
            farmName: 'Test Farms',
            phone: '555-123-1234',
            email: 'testFarm@gmail.com',
            inspection: 'exempt',
            totalHeads: 1,
        })

        const exemptJobId = this.parseJobIdFromUrl()
        await this.verifyJobInList(exemptJobId!, 'exempt')

        await this.clickNav('processor')
        await this.clickTab('add-job')

        await this.addJob({
            firstName: 'Test',
            lastName: 'Farms',
            farmName: 'Test Farms',
            phone: '555-123-1234',
            email: 'testFarm@gmail.com',
            inspection: 'usda',
            totalHeads: 1,
        })

        const usdaJobId = this.parseJobIdFromUrl()
        await this.verifyJobInList(usdaJobId!, 'usda')
    }
}
