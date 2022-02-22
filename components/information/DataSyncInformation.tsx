import {
  ResultSet,
  SelectResult,
  FunctionExpression,
  Ordering,
  Expression,
  DataSource,
  QueryBuilder,
  Database } from "@aptos-scp/react-native-couchbaselite";
import { DataSyncStatus, PeerServiceInfo } from "@aptos-scp/scp-component-rn-datasync";
import { Container } from "inversify";
import * as React from "react";
import { FlatList, ListRenderItemInfo, Text, View} from "react-native";
import I18n from "../../../config/I18n";
import Theme from "../../styles";
import InformationDetail from "./InformationDetail";
import { DI_TYPES } from "../../../config";
import { LogManager } from "@aptos-scp/scp-component-logging";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logger = LogManager.getLogger("com.aptos.storeselling.ui.components.information.datasync-information");
const MILLISECONDS_IN_ONE_MINUTE = 60000;
const CACHE_EXPIRY_IN_MINUTES = 5;
const ASYNC_STORAGE_KEY_QUERY_RESULT = "ASYNC_STORAGE_KEY_QUERY_RESULT";
interface Props {
  dataSyncStatus: DataSyncStatus;
  dataSyncRole: string;
  peerServices: PeerServiceInfo[];
  styles: any;
  diContainer: Container;
  updateRefreshing: (enable: boolean) => void;
  updateInformation: boolean;
}

interface QueryResult{
  databaseStatistics: ResultSet,
  timestamp: number
}

const DataSyncInformation = (props: Props): JSX.Element => {
  const { dataSyncRole, styles, diContainer, updateRefreshing, updateInformation } = props;
  const isTablet = Theme.isTablet;
  const [queryingDatabase, setQueryingDatabase] = React.useState(false);
  const [queryResult, setQueryResult] = React.useState<QueryResult>(null);


  const docCount = countDocuments(queryResult?queryResult.databaseStatistics:null);

  React.useEffect(() => {
    if(!queryingDatabase){
      if(updateInformation){
        if(queryResult){
          queryResult.timestamp = 0;
        }
      }
      if(cacheExpired(queryResult?queryResult.timestamp:null)){
        setQueryingDatabase(true);
        Promise.resolve()
          .then(()=>{
            if(!queryResult){
              return AsyncStorage.getItem(ASYNC_STORAGE_KEY_QUERY_RESULT);
            }
            return null;
          })
          .then((storedSerializedQueryResult: string)=>{
            let cachedQueryResult: QueryResult = queryResult;
            if(storedSerializedQueryResult){
              cachedQueryResult = JSON.parse(storedSerializedQueryResult) as QueryResult;
              setQueryResult(cachedQueryResult);
            }
            if(!cachedQueryResult || cacheExpired(cachedQueryResult.timestamp)){
              updateRefreshing(true);
              const db = diContainer.get<Database>(DI_TYPES.MasterDatabase);
              return retrieveDatabaseStatistics(db);
            }
            return null;
          })
          .then((databaseStatistics: ResultSet)=>{
            if(databaseStatistics){
              const result: QueryResult = {
                databaseStatistics,
                timestamp: Date.now()
              };
              setQueryResult(result);
              // tslint:disable-next-line: no-stringify-with-logging
              return AsyncStorage.setItem(ASYNC_STORAGE_KEY_QUERY_RESULT, JSON.stringify(result));
            }
            return null;
          })
          .then(()=>{
            updateRefreshing(false);
            setQueryingDatabase(false);
          })
          .catch((err) => {
            updateRefreshing(false);
            setQueryingDatabase(false);
            logger.error("Error querying for database document statistics", err);
          });
      }
    }
  });

  return (
    <View style={styles.informationSection}>
      <View>
        <Text style={styles.informationDisclaimer}>{I18n.t("pullToReloadInfo")}</Text>
      </View>
      <InformationDetail styles={styles} label={I18n.t("docCount")} value={docCount}/>
      <InformationDetail styles={styles} label={I18n.t("dataSyncRole")} value={dataSyncRole}/>
      <InformationDetail styles={styles} label={I18n.t("replicationStatus")} value={props.dataSyncStatus}/>
      {queryResult &&
      <InformationDetail styles={styles} label={I18n.t("documentMetricsCount")} forceMultiLine={isTablet}>
        <View style={styles.informationSecondaryLine}>
          <FlatList data={queryResult.databaseStatistics}
                    keyExtractor={(i: any) => i.type}
                    renderItem={(i) => renderDocumentStat(i, props.styles)}
                    scrollEnabled={true} style={props.styles.flatList} />
        </View>
      </InformationDetail>}
    </View>
  );
};

const cacheExpired = (chacheTimestamp: number) => !!!chacheTimestamp ||
  ((Date.now() - chacheTimestamp) / MILLISECONDS_IN_ONE_MINUTE) > CACHE_EXPIRY_IN_MINUTES;

const countDocuments = (documentStats: ResultSet) => {
  let totalDocCount = 0;
  if (documentStats) {
    documentStats.map((i: { count: number }) => {
      totalDocCount += i.count;
    });
  }
  return totalDocCount;
};

function renderDocumentStat(info: ListRenderItemInfo<any>, styles: any): React.ReactElement {
  const { type, count } = info.item;
  return (
    <View>
      <View style={styles.informationLine}>
        <Text style={styles.informationTitle}>{I18n.t("documentTypeAndCount", {type, count})}</Text>
      </View>
    </View>
  );
}

const retrieveDatabaseStatistics = async (
    db: Database
  ): Promise<ResultSet> => {
    const query = QueryBuilder
        .select(
            SelectResult.property("type"),
            SelectResult.expression(FunctionExpression.count(Expression.all())).as("count"),
            SelectResult.expression(FunctionExpression.max(Expression.property("content.updatedAt"))).as("updatedAt"))
        .from(DataSource.database(db))
        .groupBy(Expression.property("type"))
        .orderBy(Ordering.property("type"));

    const results = await query.execute();

    return results.filter((r) => !!r["type"]);
}

export default DataSyncInformation;
