import HarvesterConfig from "./basisRole/harvester/harvester"
import TransporterConfig from "./basisRole/transporter/transporter"
import WorkerConfig from "./basisRole/worker/worker"


export const creepRoleConfigs:{[role in AllRoles]:RoleConfig} = {
    harvester:new HarvesterConfig(),
    transporter:new TransporterConfig(),
    worker:new WorkerConfig(),
}
