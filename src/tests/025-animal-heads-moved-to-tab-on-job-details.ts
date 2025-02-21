import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.addJobAsProcessor()

        const oldHeads = await this.runner.findAll(
            '.tab-container-details .animal-heads-list',
            { shouldThrowIfNotFound: false }
        )
        assert.isLength(oldHeads, 0, 'Heads list should not be in details tab')
        await this.clickTabOnJobDetailsPage('heads')
        await this.runner.waitForSelector('.animal-heads-list')
    }
}
