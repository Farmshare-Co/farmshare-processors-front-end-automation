import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        assert.doesInclude(
            this.runner.getCurrentUrl(),
            '/processor/agenda',
            'Was not redirected to the agenda page!'
        )
    }
}
