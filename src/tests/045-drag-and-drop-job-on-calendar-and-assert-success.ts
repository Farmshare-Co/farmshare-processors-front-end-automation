import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.clickNav('processor')
        await this.clickTab('add-job')

        const { date } = await this.addJob({
            phone: '',
        })

        await wait(200)
        await this.clickNav('processor')
        await wait(200)

        await this.clickTab('calendar')
        const { isoFormat } = await this.addDays(date, 1)
        await this.runner.dragAndDrop(
            `[data-date="${date}"] .fc-event-draggable`,
            `[data-date="${isoFormat}"]`
        )

        await this.clickSubmit()

        await wait(100)

        await this.assertSuccessfulAction()
    }

    protected async assertSuccessfulAction() {
        const success = await this.runner.get('.toast-container .bg-primary')

        assert.isTrue(!!success)
    }
}
