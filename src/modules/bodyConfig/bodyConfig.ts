export default class BodyAutoConfig {
    static bodyConfigs = {
        harvester: BodyAutoConfig.getBodyConfig(
            { [WORK]: 2, [CARRY]: 1, [MOVE]: 1 },
            { [WORK]: 4, [CARRY]: 1, [MOVE]: 2 },
            { [WORK]: 6, [CARRY]: 1, [MOVE]: 3 },
            { [WORK]: 8, [CARRY]: 1, [MOVE]: 4 },
            { [WORK]: 10, [CARRY]: 1, [MOVE]: 5 },
            { [WORK]: 12, [CARRY]: 1, [MOVE]: 6 },
            { [WORK]: 12, [CARRY]: 1, [MOVE]: 6 },
            { [WORK]: 12, [CARRY]: 1, [MOVE]: 6 }
        ),

        /**
         * 工作单位
         * 诸如 harvester、builder 之类的
         */
        worker: BodyAutoConfig.getBodyConfig(
            { [WORK]: 1, [CARRY]: 1, [MOVE]: 1 },
            { [WORK]: 2, [CARRY]: 2, [MOVE]: 2 },
            { [WORK]: 3, [CARRY]: 3, [MOVE]: 3 },
            { [WORK]: 4, [CARRY]: 4, [MOVE]: 4 },
            { [WORK]: 6, [CARRY]: 6, [MOVE]: 6 },
            { [WORK]: 9, [CARRY]: 9, [MOVE]: 9 },
            { [WORK]: 12, [CARRY]: 6, [MOVE]: 9 },
            { [WORK]: 20, [CARRY]: 8, [MOVE]: 14 }
        ),

        /**
         * 房间物流管理单位
         * 负责转移基地资源的 creep
         */
        transporter: BodyAutoConfig.getBodyConfig(
            { [CARRY]: 2, [MOVE]: 1 },
            { [CARRY]: 3, [MOVE]: 2 },
            { [CARRY]: 4, [MOVE]: 2 },
            { [CARRY]: 5, [MOVE]: 3 },
            { [CARRY]: 8, [MOVE]: 4 },
            { [CARRY]: 14, [MOVE]: 7 },
            { [CARRY]: 20, [MOVE]: 10 },
            { [CARRY]: 32, [MOVE]: 16 }
        ),

        /**
         * 中央物流管理单位
         * 负责转移中央物流的 creep（下面其实前 4 级都用不到，因为中央物流管理员只会在 5 级有了 centerLink 之后才会孵化）
         */
        center: BodyAutoConfig.getBodyConfig(
            { [CARRY]: 2, [MOVE]: 1 },
            { [CARRY]: 3, [MOVE]: 1 },
            { [CARRY]: 5, [MOVE]: 1 },
            { [CARRY]: 7, [MOVE]: 1 },
            { [CARRY]: 11, [MOVE]: 1 },
            { [CARRY]: 14, [MOVE]: 1 },
            { [CARRY]: 26, [MOVE]: 1 },
            { [CARRY]: 39, [MOVE]: 1 }
        )
    }

    static getBodyConfig(...bodySets: [ BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet, BodySet]): BodyConfig {
        let config:BodyConfig = { "300": [], "550": [], "800": [], "1300": [], "1800": [], "2300": [], "5600": [], "10000": [] }
        // 遍历空配置项，用传入的 bodySet 依次生成配置项
        Object.keys(config).map((level, index) => {
            config[level as keyof BodyConfig] = BodyAutoConfig.calcBodyPart(bodySets[index])
        })
        return config
    }

    static calcBodyPart(bodySet: BodySet): BodyPartConstant[] {
        // 把身体配置项拓展成如下形式的二维数组
        // [ [ TOUGH ], [ WORK, WORK ], [ MOVE, MOVE, MOVE ] ]
        const bodys:BodyPartConstant[][] = Object.keys(bodySet).map(type => Array(bodySet[type as BodyPartConstant]).fill(type))
        // 把二维数组展平
        const result:BodyPartConstant[] = []
        return result.concat(...bodys)
    }

    static createBodyGetter(bodyConfig: BodyConfig): (room: Room, spawn: StructureSpawn) => BodyPartConstant[] {
        /**
         * 获取身体部件数组
         * 根据房间中现存的能量选择给定好的体型
         */
        return function(room: Room, spawn: StructureSpawn): BodyPartConstant[] {
            const targetLevel = Object.keys(bodyConfig).reverse().find(level => {
                // 先通过等级粗略判断，再加上 dryRun 精确验证
                const availableEnergyCheck = (Number(level) <= room.energyAvailable)
                const dryCheck = (spawn.spawnCreep(bodyConfig[level as keyof BodyConfig], 'bodyTester', { dryRun: true }) == OK)


                return availableEnergyCheck && dryCheck
            })
            if (!targetLevel) return [ ]
            // 获取身体部件
            const bodys: BodyPartConstant[] = bodyConfig[targetLevel as keyof BodyConfig]
            // console.log(`RoomEnergyAvailable为${room.energyAvailable},TargetLevl为${targetLevel},身体部件为${JSON.stringify(bodys)},reverse为${JSON.stringify(Object.keys(bodyConfig).reverse())}`)

            return bodys
        }
    }
}
