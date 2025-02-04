import Runner from './Runner/Runner'

void (async () => {
    const runner = await Runner.Runner()
    await runner.login()

    await runner.shutdown()
})()
