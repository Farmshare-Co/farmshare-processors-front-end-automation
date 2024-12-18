export default async function wait(waitMs: number) {
    await new Promise((resolve) => setTimeout(resolve, waitMs))
}
