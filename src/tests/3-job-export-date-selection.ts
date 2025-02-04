import Runner from '../Runner/Runner'
import wait from '../Runner/wait'

export default async (runner: Runner) => {
    await runner.redirect('/admin/job-export')
    await wait(3000)
    await runner.clickAtIndex('button', 2)
    await runner.redirect('/processor')
}
