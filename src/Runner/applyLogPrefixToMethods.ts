const methodChain: string[] = []

export function applyLogPrefixToMethods(reference: any) {
    const methods = [
        ...Object.getOwnPropertyNames(reference),
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(reference)),
        ...Object.getOwnPropertyNames(
            Object.getPrototypeOf(Object.getPrototypeOf(reference))
        ),
    ].flat()

    for (const method of methods) {
        if (
            method === 'constructor' ||
            method === 'setLogPrefix' ||
            method === 'log' ||
            method === 'setLogPrefix'
        ) {
            continue
        }

        const original = reference[method]

        //need to be able to tell if the function is async or not
        const type = original.constructor.name

        if (type === 'AsyncFunction') {
            reference[method] = async (...args: any[]) => {
                const originallog = reference.log
                methodChain.push(method)

                //@ts-ignore
                reference.log = originallog.buildLog(methodChain.join('.'))
                try {
                    const results = await original.apply(reference, args)
                    return results
                } catch (err: any) {
                    reference.log.error(err.message)
                    throw err
                } finally {
                    reference.log = originallog
                    methodChain.pop()
                }
            }
        } else if (type === 'Function') {
            reference[method] = (...args: any[]) => {
                const originallog = reference.log
                //@ts-ignore
                reference.log = originallog.buildLog(method)
                try {
                    const results = original.apply(reference, args)
                    reference.log = originallog
                    return results
                } catch (err: any) {
                    reference.log.error(err.message)
                    reference.log = originallog
                    throw err
                }
            }
        }
    }
}
