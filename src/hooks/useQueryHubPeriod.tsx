import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import AutSDK, { Hub } from "@aut-labs/sdk";
import { HubData } from "@store/Hub/hub.reducer";

export interface HubPeriodData {
  hub: string;
  periodId: number;
  startDate: Date;
  endDate: Date;
  isSealed: boolean;
  pointsActive: number;
  pointsGiven: number;
  pointsRemoved: number;
}

const fetchHubPeriodData = async (
  hubAddress: string
): Promise<HubPeriodData> => {
  const sdk = await AutSDK.getInstance();
  const hubService: Hub = sdk.initService<Hub>(Hub, hubAddress);
  const taskManager = await hubService.getTaskManager();
  const periodId = await taskManager.functions.currentPeriodId();
  const [startDate, endDate, pointSummary] = await Promise.all([
    taskManager.functions.currentPeriodStart(),
    taskManager.functions.currentPeriodEnd(),
    taskManager.functions.pointSummaries(Number(periodId))
  ]);

  return {
    hub: hubAddress,
    periodId: Number(periodId),
    startDate: new Date(Number(startDate) * 1000),
    endDate: new Date(Number(endDate) * 1000),
    isSealed: pointSummary.isSealed,
    pointsActive: Number(pointSummary.pointsActive),
    pointsGiven: Number(pointSummary.pointsGiven),
    pointsRemoved: Number(pointSummary.pointsRemoved)
  };
};

const useQueryHubPeriod = () => {
  const hubData = useSelector(HubData);
  const hubAddress = hubData?.properties?.address;

  const {
    data: periodData,
    isLoading: loadingMetadata,
    error
  } = useQuery<HubPeriodData>({
    queryKey: ["hubPeriodData", hubAddress],
    queryFn: () => fetchHubPeriodData(hubAddress),
    enabled: !!hubAddress
  });

  return {
    data: periodData,
    loading: loadingMetadata,
    error
  };
};

export default useQueryHubPeriod;
