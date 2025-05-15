import { assert } from '@sprucelabs/test-utils'
import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.login()
    await run.run()
    await runner.shutdown()
    console.log('TEST PASSED!')
})()

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.setDepositAndVerify('100')

        await this.scheduleAsProducerCancelCheckoutAndAssertSlotsNotChanged()

        await this.setDepositAndVerify('0')

        const { slotsRemaining } = await this.addJobAsProducer({
            shouldCheckout: false,
        })

        await this.runner.close()

        await this.navigateToAddJob()

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

        await this.navigateToAddJob()

        const actual = await this.getSlotsRemainingOnAddJobTab()

        assert.isEqual(
            actual,
            slotsRemaining,
            'Slots remaining should not decrement because the job was not checked out'
        )
    }
}
