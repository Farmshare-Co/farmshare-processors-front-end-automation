import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.clickNav('processor')
        await this.clickTab('settings')

        await this.toggleChips(
            ['beef', 'whole'],
            [
                'quarters',
                'half_and_two_quarters',
                'half',
                'hog',
                'bison',
                'lamb',
                'goat',
                'venison',
                'yak',
            ]
        )

        await this.clickSubmit()

        await this.clickTab('add-job')

        await this.fillOutAddJobForm({
            firstName: 'Test',
            lastName: 'Farms',
            farmName: 'Test Farms',
            phone: '555-123-1234',
            email: 'testFarm@gmail.com',
            inspection: false,
            totalHeads: 1,
        })

        const results = await this.runner.getValue(
            '[name="scheduledHeads[0].splitType"]'
        )

        assert.isEqual(
            results,
            'whole',
            `Did not auto-selected usda in add job form`
        )

        await this.clickSubmit()

        await this.clickTab('jobs')

        const jobId = this.parseJobIdFromUrl()
        await this.navigateToJobDetailBySearch({ jobId, search: 'Test Farms' })

        await this.clickTab('heads')

        await this.runner.click('.card-body tr a')

        await this.runner.click('.btn-edit-split-type')

        const wholeOnly = await this.runner.getValue('[name="splitType"]')

        assert.isEqual(
            wholeOnly,
            'whole',
            `Did not auto-selected usda in add job form`
        )

        await this.runner.select('[name="splitType"]', 'whole')

        await this.clickSubmit()

        await this.assertSuccessfulAction()
    }

    private async assertSuccessfulAction() {
        const success = await this.runner.get('.toast-container .bg-success')

        assert.isTrue(!!success)
    }
}
