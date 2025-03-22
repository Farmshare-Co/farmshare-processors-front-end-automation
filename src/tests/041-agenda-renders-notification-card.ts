import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.clickNav('processor')
        await this.clickTab('agenda')
        await this.scrollToBottomOfPage()
        await wait(3000)

        await this.runner.getProp('.notifications .card-bodysss', 'className')
    }
}
