// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as v from './src';

const BrandedSchema = v.pipe(
    v.string(),
    v.brand<{ brand: 'Test' }>()
)






type Output = v.InferOutput<typeof BrandedSchema>
