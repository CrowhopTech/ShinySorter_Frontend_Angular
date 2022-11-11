/**
 * shiny-sorter
 * Endpoint definitions for the shiny-sorter file sorting project
 *
 * OpenAPI spec version: alpha-v0.2
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { TagOption } from './tagOption';


export interface QuestionPatch { 
    orderingID?: number;
    questionText?: string;
    tagOptions?: Array<TagOption>;
    /**
     * Whether this functions as an \"and\" (true, only one option selected) or an \"or\" question false, default, can select multiple)
     */
    mutuallyExclusive?: QuestionPatch.MutuallyExclusiveEnum;
}
export namespace QuestionPatch {
    export type MutuallyExclusiveEnum = 'true' | 'false';
    export const MutuallyExclusiveEnum = {
        True: 'true' as MutuallyExclusiveEnum,
        False: 'false' as MutuallyExclusiveEnum
    };
}