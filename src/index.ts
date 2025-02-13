import { assert } from '@sprucelabs/test-utils'
import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.run()
})()

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.login()
        await this.setDepositAndVerify('100')
        await this.deleteAllJobsInProgress()
        await this.addJobAsProducer()
        await this.runner.close()

        await this.clickNav('processor')

        const jobIds = await this.declineAllJobsNeedingApproval()

        await this.assertAllJobsNotInNeedsApproval(jobIds)
        await this.assertAllJobsNotInNeedsAttention(jobIds)
        await this.runner.refresh()
        await this.assertAllJobsNotInNeedsApproval(jobIds)
        await this.assertAllJobsNotInNeedsAttention(jobIds)
    }

    private async declineAllJobsNeedingApproval() {
        const jobIds: string[] = []

        do {
            const jobId = await this.runner.getProp(
                '.pending-approvals [data-id]',
                'data-id',
                {
                    shouldThrowIfNotFound: false,
                }
            )

            if (!jobId) {
                break
            }

            jobIds.push(jobId)

            const reviewButton = await this.runner.get(
                `.pending-approvals [data-id="${jobId}"] .btn-review`
            )

            if (!reviewButton) {
                break
            }

            await reviewButton.click({})
            await this.runner.click('.modal-dialog .btn-danger')
        } while (true)
        return jobIds
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
