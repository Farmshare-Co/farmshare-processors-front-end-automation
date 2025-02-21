import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        const url = this.runner.getCurrentUrl()

        assert.doesInclude(
            url,
            '/processor/agenda',
            'Was not redirected to the agenda page!'
        )
    }
}
