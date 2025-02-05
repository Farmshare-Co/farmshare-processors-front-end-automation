import { SingleRun } from '../automation.types'
import Runner from './Runner'

export abstract class AbstractSingleRun implements SingleRun {
    protected runner: Runner
    public constructor(runner: Runner) {
        this.runner = runner
    }

    public abstract run(): Promise<void>
}
