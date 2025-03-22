import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        const expectedPersonData = {
            firstName: process.env.CUSTOMER_1_FIRST ?? 'John',
            lastName: process.env.CUSTOMER_1_LAST ?? 'Doe',
            inspection: 'usda',
        }
        const { id } = await this.addJobAsProcessor(expectedPersonData)

        await this.navigateToJobDetailBySearch({
            jobId: id,
            search:
                expectedPersonData.firstName +
                ' ' +
                expectedPersonData.lastName,
        })

        await this.clickTab('heads')

        const text = (
            await this.runner.getInnerText('.animal-heads-list a')
        )?.toLowerCase()

        assert.isTrue(
            text?.includes(expectedPersonData.inspection.toLowerCase())
        )
        assert.isTrue(
            text?.includes(expectedPersonData.firstName.toLowerCase())
        )
        assert.isTrue(text?.includes(expectedPersonData.lastName.toLowerCase()))
        await wait(1000)

        await this.runner.getProp('.btn-add-animal-head', 'className', {
            shouldThrowIfNotFound: true,
        })
    }
}
