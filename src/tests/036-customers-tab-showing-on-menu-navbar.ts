import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.clickNav('processor')
        await this.clickTab('customers')
        const url = this.runner.getCurrentUrl()
        const match = url.includes('/processor/customers?page=1')
        assert.isTrue(match)

        await wait(3000)
    }
}
