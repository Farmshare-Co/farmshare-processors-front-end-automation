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
            firstName: process.env.CUSTOMER_2_FIRST ?? 'John',
            lastName: process.env.CUSTOMER_2_LAST ?? 'Doe',
            email: process.env.CUSTOMER_2_EMAIL ?? 'johndoefarm@gmail.com',
            phone: process.env.CUSTOMER_2_PHONE ?? '999-999-1234',
            farmName: process.env.CUSTOMER_2_FARM ?? "Jonh's Farm",
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

        const jobId = this.parseJobIdFromUrl()
        await this.clickNav('processor')
        await this.clickTab('jobs')

        //TODO use CUSTOMER_2_FARM
        await this.navigateToJobDetailBySearch({
            jobId,
            search: process.env.CUSTOMER_2_FARM ?? "Jonh's Farm",
        })

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
}
