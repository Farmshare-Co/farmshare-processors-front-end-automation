import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        // can't do this one unless logged in as admin
        // await this.runner.redirect('/admin/job-export')
        // await wait(3000)
        // await this.runner.clickAtIndex('button', 2)
        // await this.runner.redirect('/processor')
    }
}
