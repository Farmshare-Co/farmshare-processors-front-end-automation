import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.clickNav('processor')
        await this.clickTab('settings')
        await this.runner.click('.btn-weighted_animal_unit')
        await this.runner.clickAtIndex('.btn-ghost', 1)

        await this.runner.setInputValue('.animalUnitCapacitySettings-beef', '0')
        await this.runner.setInputValue('.animalUnitCapacitySettings-hog', '0')

        for (let i = 0; i < 10; i++) {
            await this.runner.clickAtIndex('.btn-ghost', 2)
            await wait(300)
        }

        for (let i = 0; i < 16; i++) {
            await this.runner.clickAtIndex('.btn-ghost', 4)
            await wait(300)
        }

        await this.clickSubmit()

        await this.runner.refresh()

        const beefValue = await this.runner.getValue(
            '.animalUnitCapacitySettings-beef'
        )
        const hogValue = await this.runner.getValue(
            '.animalUnitCapacitySettings-hog'
        )

        assert.isEqual(beefValue, '1')
        assert.isEqual(hogValue, '1.6')
    }
}
