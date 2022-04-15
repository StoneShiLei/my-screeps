interface Room{

}

interface RoomMemory{
    center?: [ number, number ]

    centerLinkId?: Id<StructureLink>
    upgradeLinkId?: Id<StructureLink>

    constructionSiteId?: Id<ConstructionSite>
    focusWall?: {
        id: Id<StructureWall | StructureRampart>
        endTime: number
    }
}
