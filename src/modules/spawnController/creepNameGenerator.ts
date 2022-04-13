/**
 * 统一获取 creep 名称
 * 项目中想要获取某个 creep 的名字必须通过这里获取
 */
 export class CreepNameGenerator {
    static harvester = (roomName: string, index: number) => `${roomName} harvester${index}`
    static worker = (roomName: string, index: number) => `${roomName} worker${index}`
    static transporter = (roomName: string, index: number) => `${roomName} transporter${index}`
    static center = (roomName: string) => `${roomName} center`
    static claimer = (targetRoomName: string) => `${targetRoomName} claimer`
    static reserver = (targetRoomName: string) => `${targetRoomName} reserver${Game.time}`
    // static signer = (roomName: string) => `${roomName} signer`
    // static buildeSupporter = (remoteRoomName: string) => `${remoteRoomName} buildeSupporter`
    // static upgradeSupporter = (remoteRoomName: string) => `${remoteRoomName} upgradeSupporter`
    // static remoteHarvester = (remoteRoomName: string, index: number) => `${remoteRoomName} remoteHarvester${index}`
    // static depositHarvester = (flagName: string) => `${flagName} depoHarvester`
    // static pbAttacker = (flagName: string, index: number) => `${flagName} attacker${index}`
    // static pbHealer = (flagName: string, index: number) => `${flagName} healer${index}`
    // static pbCarrier = (flagName: string, index: number) => `${flagName} carrier${index}`
    // static reiver = (roomName: string) => `${roomName} reiver ${Game.time}`
    // static soldier = (roomName: string, index: number) => `${roomName} soldier ${Game.time}-${index}`
    // static boostDoctor = (roomName: string) => `${roomName} doctor ${Game.time}`
    // static dismantler = (roomName: string, index: number) => `${roomName} dismantler ${Game.time}-${index}`
    // static boostDismantler = (roomName: string) => `${roomName} dismantler ${Game.time}`
    // static apocalypse = (roomName: string) => `${roomName} apocalypse ${Game.time}`
    // static defender = (roomName: string) => `${roomName} defender`
    // static repair = (roomName: string, index: number) => `${roomName} defender${index}`
}
