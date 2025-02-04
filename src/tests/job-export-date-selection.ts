import Runner from '../Runner/Runner'
import wait from '../Runner/wait'

void (async () => {
    const runner = await Runner.Runner()
    await runner.login()
    await runner.redirect('/admin/job-export')
    await wait(3000)
    await runner.clickAtIndex('button', 2);
 
})()


    
