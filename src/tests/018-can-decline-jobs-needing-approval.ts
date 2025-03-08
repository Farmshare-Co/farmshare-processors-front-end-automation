import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.setDepositAndVerify('100')
        await this.deleteAllJobsInProgress()
        await this.addJobAsProducer()
        await this.runner.close()

        await this.clickNav('processor')
        await this.refreshAndWaitForLoad()

        await wait(5000)

        debugger

        const jobIds = await this.declineAllJobsNeedingApproval()

        assert.isAbove(
            jobIds.length,
            0,
            `I couldn't find any jobs needing approval to decline!`
        )

        await this.assertAllJobsNotInNeedsApproval(jobIds)
        await this.assertAllJobsNotInNeedsAttention(jobIds)
        await this.refreshAndWaitForLoad()
        await this.assertAllJobsNotInNeedsApproval(jobIds)
        await this.assertAllJobsNotInNeedsAttention(jobIds)
    }

    private async assertAllJobsNotInNeedsAttention(jobIds: string[]) {
        for (const jobId of jobIds) {
            await this.assertJobNotInNeedsAttention(jobId)
        }
    }

    private async assertAllJobsNotInNeedsApproval(jobIds: string[]) {
        for (const jobId of jobIds) {
            await this.assertJobNotInNeedsApproval(jobId)
        }
    }

    private async assertJobNotInNeedsAttention(jobId: {}) {
        const match = await this.runner.get(
            `.needs-attention [data-id="${jobId}"]`,
            {
                shouldThrowIfNotFound: false,
            }
        )

        assert.isFalsy(
            match,
            'The declined job is still in the needs-attention table'
        )
    }

    private async assertJobNotInNeedsApproval(jobId: {}) {
        const match = await this.runner.get(
            `.needs-approval [data-id="${jobId}"]`,
            {
                shouldThrowIfNotFound: false,
            }
        )

        assert.isFalsy(
            match,
            'The declined job is still in the needs-approval table'
        )
    }
}
