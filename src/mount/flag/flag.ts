
export class FlagExtension extends Flag{

    idGetter():Id<Flag>{
        const flagId = this.name as Id<Flag>
        console.log(flagId)
        return flagId
    }
}
