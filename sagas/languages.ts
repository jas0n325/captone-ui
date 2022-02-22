import { DI_TYPES,    IAppLocalCoreStorage,
   ITranslationManager, LanguageFields, Languages } from "@aptos-scp/scp-component-store-selling-core";
import { Container } from "inversify";
import moment from "moment";
import { ILogger, LogManager } from "../../../node_modules/@aptos-scp/scp-component-logging";

const AppID = "SSA";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.languages");

const languagesExtract = (languages: Languages): Languages => {
    const result: Languages = {
        updatedSince: 0,
        languages: {
            [AppID]: []
        }
    };
    if (languages && languages.languages && languages.languages[AppID]) {
        result.updatedSince = languages.updatedSince;
        result.languages[AppID] = [...languages.languages[AppID]];
    }
    return result;
};


const getLanguagesAPI = async (updatedSince: number, diContainer: Container): Promise<Languages> => {
    const intiResult: Languages = {
        updatedSince: 0,
        languages: {
            [AppID]: []
        }
    };
    try {
        const translationManager = diContainer.get<ITranslationManager>(DI_TYPES.ITranslationManager);
        const languagesApiResponse = await translationManager.getLanguages([AppID], updatedSince);
        const apiLanguages = languagesExtract(languagesApiResponse);
        apiLanguages.updatedSince = moment().valueOf();
        return apiLanguages;
    } catch (error) {
        logger.error("Error calling languages api", error);
        return intiResult;
    }
};

const getLanguagesCache = async (diContainer: Container): Promise<Languages> => {
    const intiResult: Languages = {
        updatedSince: 0,
        languages: {
            [AppID]: []
        }
    };
    try {
        const appLocalCoreStorage = diContainer.get<IAppLocalCoreStorage>(DI_TYPES.IAppLocalCoreStorage);
        const languagesCacheResponse = await appLocalCoreStorage.loadTranslationLanguages(AppID);
        const cacheLanguages = languagesExtract(languagesCacheResponse);
        return cacheLanguages;
    } catch (error) {
        logger.error("Error getting languages from cache", error);
        return intiResult;
    }
};

const merge = (apiLanguages: LanguageFields[], cacheLanguages: LanguageFields[] ): LanguageFields[] => {
    const intiResult: LanguageFields[] = [];
    try {
        const newLanguages = apiLanguages.filter((item) => {
            return cacheLanguages.filter((x) => x.localeId === item.localeId).length === 0;
        });
        if (newLanguages && newLanguages.length > 0) {
            cacheLanguages.push(...newLanguages);
        }
        return cacheLanguages;
    } catch (error) {
        logger.error("Error merging result", error);
        return intiResult;
    }
};

export const getLanguages = async (diContainer: Container): Promise<LanguageFields[]> => {
try {
        const cacheLanguages = await getLanguagesCache(diContainer);
        const apiLanguages = await getLanguagesAPI(cacheLanguages.updatedSince, diContainer);
        const appLocalCoreStorage = diContainer.get<IAppLocalCoreStorage>(DI_TYPES.IAppLocalCoreStorage);

        // no languages in the cache
        if (cacheLanguages.languages[AppID].length === 0) {
            await appLocalCoreStorage.storeTranslationLanguages(AppID, apiLanguages);
            return apiLanguages.languages[AppID];
        }

        // no languages returned by API
        if (apiLanguages.languages[AppID].length === 0) {
            return cacheLanguages.languages[AppID];
        }

        //merging results
        const languages = merge(apiLanguages.languages[AppID], cacheLanguages.languages[AppID]);

        // if some languages returned by API
        if (apiLanguages.languages[AppID].length > 0) {
            const result: Languages = {
                updatedSince: apiLanguages.updatedSince,
                languages: {
                    [AppID]: languages
                }
            };
            await appLocalCoreStorage.storeTranslationLanguages(AppID, result);
        }
        return cacheLanguages.languages[AppID];
    } catch (error) {
        logger.error("Error calling languages api", error);
        return [];
    }
};
