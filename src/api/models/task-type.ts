import { BaseNFTModel } from "@aut-labs/sdk";

export interface TaskType {
    id: string;
    metadataUri: string;
    taskId: string;
    creator: string;
    metadata: BaseNFTModel<any>;
}