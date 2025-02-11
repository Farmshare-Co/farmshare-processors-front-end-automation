import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.setDepositAndVerify('100')

        await this.scheduleAsProducerCancelCheckoutAndAssertSlotsNotChanged()

        await this.setDepositAndVerify('0')

        const { slotsRemaining } = await this.addJobAsProducer({
            shouldCheckout: false,
        })

        await this.runner.close()

        await this.clickTab('add-job')

        const actual = await this.getSlotsRemainingOnAddJobTab()

        assert.isEqual(
            actual,
            slotsRemaining - 1,
            'Slots remaining should decrement by one because the job had no deposit'
        )
    }

    private async scheduleAsProducerCancelCheckoutAndAssertSlotsNotChanged() {
        const { slotsRemaining } = await this.addJobAsProducer({
            shouldCheckout: false,
        })

        await this.runner.close()

        await this.clickTab('add-job')

        const actual = await this.getSlotsRemainingOnAddJobTab()

        assert.isEqual(
            actual,
            slotsRemaining,
            'Slots remaining should not decrement because the job was not checked out'
        )
    }
}
