

export class ErrorHelper {

    static errors:string[] = []

    static catchError(func:(...args: any[]) => unknown,message?:string){
        try{
            return func()
        }
        catch(e){
            if(e instanceof Error){
                let data = e.stack
                if(message) data = "\n"+message+"\n"+e.stack

                this.errors.push(data + "\n\n**************\n")
            }
        }
    }

    static throwAllErrors(){
        if(this.errors.length > 0){
            const temp = this.errors;
            this.errors = []
            throw new Error(temp.join("\n"))
        }
    }
}
