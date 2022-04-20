

export default class Utils{

    /**
     * 给目标类型添加getter
     * @param target
     * @param name
     * @param getter
     */
    static createGetter(target: AnyObject, name: string, getter: () => any) {
        Object.defineProperty(target.prototype, name, {
            get: getter,
            enumerable: false,
            configurable: true
        })
    }

    /**
     * 把 obj2 的原型合并到 obj1 的原型上
     * 如果原型的键以 Getter 结尾，则将会把其挂载为 getter 属性
     * @param obj1 要挂载到的对象
     * @param obj2 要进行挂载的对象
     */
    static assignPrototype(obj1: {[key: string]: any}, obj2: {[key: string]: any}) {
        Object.getOwnPropertyNames(obj2.prototype).forEach(key => {
            if (key.includes('Getter')) {
                Object.defineProperty(obj1.prototype, key.split('Getter')[0], {
                    get: obj2.prototype[key],
                    enumerable: false,
                    configurable: true
                })
            }
            else obj1.prototype[key] = obj2.prototype[key]
        })
    }

    /**
     * 给指定文本添加颜色
     *
     * @param content 要添加颜色的文本
     * @param colorName 要添加的颜色常量字符串
     * @param bolder 是否加粗
     */
    static colorful(content: string, bolder: boolean = false,colorName?:Colors ): string {
        const colorStyle = colorName ? `color: ${colorName};` : ''
        const bolderStyle = bolder ? 'font-weight: bolder;' : ''

        return `<text style="${[ colorStyle, bolderStyle ].join(' ')}">${content}</text>`
    }

    /**
     * 全局日志
     *
     * @param content 日志内容
     * @param prefixes 前缀中包含的内容
     * @param color 日志前缀颜色
     * @param notify 是否发送邮件
     */
    static log(content: string, prefixes: string[] = [], notify: boolean = false, color?: Colors): OK {
        // 有前缀就组装在一起
        let prefix = prefixes.length > 0 ? `【${prefixes.join(' ')}】 ` : ''
        // 指定了颜色
        prefix = this.colorful(prefix, true,color)

        const logContent = `${prefix}${content}`
        console.log(logContent)
        // 转发到邮箱
        if (notify) Game.notify(logContent)

        return OK
    }

    /**
     * 随机id
     * @returns
     */
    static randomId():string{
        return _.padLeft(Math.ceil(Math.random()*Math.pow(2,32)).toString(16).toLocaleUpperCase(),8,"0")
    }

    /**
     * 获取hashCode
     * @param str
     * @returns
     */
    static hashCode(str:string):number{
        let hash = 5381;
        for(let i=0;i<str.length;i++){
            let char = str.charCodeAt(i);
            hash = ((hash << 5) + hash) + char;
        }
        return hash
    }

    /**
     * 线性同余随机数
     * @param seed
     * @returns
     */
    static randomNum(seed:number){
        return (seed * 9301 + 49297 ) % 233280;
    }

    /**
     * 生成范围随机数
     * @param start
     * @param end
     * @returns
     */
    static randomNumRange(start:number,end?:number){
        if(end==undefined){
            end = start
            start = 0
        }
        let range = end-start
        return start + Math.floor(Math.random()*range)
    }
}



