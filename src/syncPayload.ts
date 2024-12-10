export type Override<Type, NewType> = Omit<Type, keyof NewType> & NewType;

export type SyncPayload = {
  version: number;
}
  
export type SyncPayloadV1 = Override<SyncPayload, {
  version: 1;
  database: string;
  tables: string[];
}>;
  
export type SyncPayloadV2 = Override<SyncPayloadV1, {
  version: 2;
  maps: string[];
}>;

export var syncPayload: SyncPayloadV2 = {
  version: 2,
  maps: ['maps/Waterbodies_Line.zip'],
  database: 'database/database.zip',
  tables: ['location', 'workorder'],
};
