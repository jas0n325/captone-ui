
import { LogManager } from "@aptos-scp/scp-component-logging";
import { AckTaskType, CompleteTaskType, composeTaskDispatcher, FailTaskType, FetchNextTaskType, Task, TaskHandlerRegistry, TaskHandlerType, TaskResponse } from "@aptos-scp/scp-component-task-dispatcher";
import { TaskHandlerParams } from "@aptos-scp/scp-component-task-dispatcher/lib/models/task.handler.params";
import { Container } from "inversify";
import { DI_TYPES, ITaskManager } from "@aptos-scp/scp-component-store-selling-core"
import { Settings } from "../actions";
import uuid from "uuid";
import { IAppLocalDeviceStorage } from "../../persistence/IAppLocalDeviceStorage";
import { DI_TYPES as TYPES} from "../../config";
import { taskHandlers } from "@aptos-scp/scp-component-rn-datasync"

const logger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.tasks");

let _appLocalDeviceStorage: IAppLocalDeviceStorage;
let _taskManager: ITaskManager;
let _appId: string;

export const initializeTaskDispatcher = async (diContainer: Container, settings: Settings): Promise<void> => {
  try {
    if (diContainer) {

      if (settings) {
        _appId = settings.deviceIdentity.retailLocationId + "." + settings.deviceIdentity.deviceId + ".store-selling"
      }

      _appLocalDeviceStorage = diContainer.get<IAppLocalDeviceStorage>(TYPES.IAppLocalDeviceStorage);
      _taskManager = diContainer.get<ITaskManager>(DI_TYPES.ITaskManager);

      if (_taskManager) {
        TaskHandlerRegistry.register("db-reset", databaseResetTask,true);
        TaskHandlerRegistry.register("db-logging", taskHandlers.logging);
        TaskHandlerRegistry.register("db-uploadLogs", taskHandlers.uploadLogs);

        const dispatcher = composeTaskDispatcher(fetchFn, ackFn, errorFn, completeFn);
        const res = await dispatcher();
        logger.info(`Processed ${res.length} tasks`);
        res.forEach(x=>logger.info(`precessed TaskId: ${x.task?.id}. Status: ${x.status}. CorrelationId: ${x.task.correlationId}`));
      }
    }

  } catch (err) {
    await _appLocalDeviceStorage.storeCouchbaseResetFlag("false");
    logger.error(`Error initializing task dispatcher: ${err}`);
  }
};

const databaseResetTask: TaskHandlerType<never>  =
  async (request: TaskHandlerParams<never>): Promise<string | void> => {
    await _appLocalDeviceStorage.storeCouchbaseResetFlag("true");
    logger.debug(`Set Master Couchbase database reset flag to true`);
};

const fetchFn: FetchNextTaskType = async (): Promise<TaskResponse> => {
  const ts =  await _taskManager.FetchTasks(_appId, uuid.v4());
  logger.debug(`fetchFn: ${ts.length}`)
  return {
    tasks:ts
  }
};

const ackFn: AckTaskType = (task: Task): Promise<void> => {
  return _taskManager.AcknowledgeTask(task.id, task.correlationId);
};

const completeFn: CompleteTaskType = (task: Task): Promise<void> => {
    return _taskManager.CompleteTask(task.id, task.correlationId);
};

const errorFn: FailTaskType = (task: Task, error: any): Promise<void> => {
  return _taskManager.FailTask(task.id, task.correlationId, error)
};
