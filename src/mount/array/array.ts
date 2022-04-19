export class ArrayExtension<T> extends Array<T> {
    head():T {
       return _.head(this)
    }

    last(): T {
        return _.last(this)
    }
}
