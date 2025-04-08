import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

//did not work
export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.addJobAsProcessor()
        const actual = await this.getDepositAmount()
        assert.isEqual(actual, '-', 'Invalid deposit amount')
        await this.setDepositAndVerify('100')
        await this.addJobAsProducer({
            zip: false,
        })
        await this.runner.close()
    }

    private async getDepositAmount() {
        const innerHtml = await this.runner.getInnerHtml(
            '.deposit-amount .value span'
        )

        const actual = innerHtml.trim()
        return actual
    }
}
