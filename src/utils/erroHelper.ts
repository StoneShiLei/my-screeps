
export class ErrorHelper {

    errors:string[] = []

    catchError(func:Function,message?:string){
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

    throwAllErrors(){
        if(this.errors.length > 0){
            const temp = this.errors;
            this.errors = []
            throw new Error(temp.join("\n"))
        }
    }
}
