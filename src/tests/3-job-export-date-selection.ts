import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.runner.redirect('/admin/job-export')
        await wait(3000)
        await this.runner.clickAtIndex('button', 2)
        await this.runner.redirect('/processor')
    }
}
