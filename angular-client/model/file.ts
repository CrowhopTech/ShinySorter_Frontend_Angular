/**
 * shiny-sorter
 * Endpoint definitions for the shiny-sorter file sorting project
 *
 * OpenAPI spec version: alpha-v0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


export interface File { 
    id?: string;
    md5sum?: string;
    tags?: Array<number>;
    hasBeenTagged?: boolean;
    mimeType?: string;
}
