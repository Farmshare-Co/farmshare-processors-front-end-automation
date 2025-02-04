import { assert } from '@sprucelabs/test-utils'
import Runner from '../Runner/Runner'

export default async (runner: Runner) => {
    assert.doesInclude(
        runner.getCurrentUrl(),
        '/processor/agenda',
        'Was not redirected to the agenda page!'
    )
}
