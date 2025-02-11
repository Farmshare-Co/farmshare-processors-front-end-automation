import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.setDepositAndVerify('100')
        await this.setDepositAndVerify('0')
    }
}
