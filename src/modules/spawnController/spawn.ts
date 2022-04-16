
export default class SpawnExtension extends StructureSpawn {
    onWork(): void {
        this.room.spawnController.runSpawn(this)
    }
}
