import { assert } from '@sprucelabs/test-utils'
import Runner from '../Runner/Runner'
void (async () => {
    const runner = await Runner.Runner()
    await runner.login()

    assert.doesInclude(runner.getCurrentUrl(), '/processor/agenda', 'Was not redirected to the agenda page!')

    await runner.shutdown()
})()

