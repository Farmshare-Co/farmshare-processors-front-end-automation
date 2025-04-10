import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.navigateToAgenda()
        await this.scrollToBottomOfPage()
        await wait(3000)

        await this.runner.getProp('.notifications .card-body', 'className')
    }
}
