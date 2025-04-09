import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.declineAllJobsNeedingApproval()

        const { id } = await this.addJobAsProcessor()

        await this.navigateToAgenda()

        await wait(1000)

        const status = 'Dropped_Off'

        const statusSeletor = `[data-id="${id}"] select`
        await this.selectValue(statusSeletor, status)

        await this.setInputValue('animalHeads.0.liveWeight', '500')

        await this.clickSaveInDialog()

        await this.assertInputValueEquals(statusSeletor, status)

        await this.refreshAndWaitForLoad()

        await this.assertInputValueEquals(statusSeletor, status)
    }
}
