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
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent }                           from '@angular/common/http';
import { CustomHttpUrlEncodingCodec }                        from '../encoder';

import { Observable }                                        from 'rxjs';

import { FileCreate } from '../model/fileCreate';
import { FileEntry } from '../model/fileEntry';
import { FilePatch } from '../model/filePatch';
import { QuestionCreate } from '../model/questionCreate';
import { QuestionEntry } from '../model/questionEntry';
import { QuestionPatch } from '../model/questionPatch';
import { TagCreate } from '../model/tagCreate';
import { TagEntry } from '../model/tagEntry';
import { TagPatch } from '../model/tagPatch';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


@Injectable()
export class DefaultService {

    protected basePath = 'http://localhost';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();

    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string, @Optional() configuration: Configuration) {
        if (basePath) {
            this.basePath = basePath;
        }
        if (configuration) {
            this.configuration = configuration;
            this.basePath = basePath || configuration.basePath || this.basePath;
        }
    }

    /**
     * @param consumes string[] mime-types
     * @return true: consumes contains 'multipart/form-data', false: otherwise
     */
    private canConsumeForm(consumes: string[]): boolean {
        const form = 'multipart/form-data';
        for (const consume of consumes) {
            if (form === consume) {
                return true;
            }
        }
        return false;
    }


    /**
     * 
     * 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public checkHealth(observe?: 'body', reportProgress?: boolean): Observable<string>;
    public checkHealth(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<string>>;
    public checkHealth(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<string>>;
    public checkHealth(observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'text/plain'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];

        return this.httpClient.get<string>(`${this.basePath}/healthz`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Creates a new file entry
     * @param id File ID
     * @param newFile The new file to create
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createFile(id: string, newFile: FileCreate, observe?: 'body', reportProgress?: boolean): Observable<FileEntry>;
    public createFile(id: string, newFile: FileCreate, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<FileEntry>>;
    public createFile(id: string, newFile: FileCreate, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<FileEntry>>;
    public createFile(id: string, newFile: FileCreate, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling createFile.');
        }

        if (newFile === null || newFile === undefined) {
            throw new Error('Required parameter newFile was null or undefined when calling createFile.');
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected != undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        return this.httpClient.post<FileEntry>(`${this.basePath}/files/${encodeURIComponent(String(id))}`,
            newFile,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Creates a new question
     * @param newQuestion The new question to create
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createQuestion(newQuestion?: QuestionCreate, observe?: 'body', reportProgress?: boolean): Observable<QuestionEntry>;
    public createQuestion(newQuestion?: QuestionCreate, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<QuestionEntry>>;
    public createQuestion(newQuestion?: QuestionCreate, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<QuestionEntry>>;
    public createQuestion(newQuestion?: QuestionCreate, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {


        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected != undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        return this.httpClient.post<QuestionEntry>(`${this.basePath}/questions`,
            newQuestion,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Creates a new tag
     * @param newTag The new tag to create
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createTag(newTag?: TagCreate, observe?: 'body', reportProgress?: boolean): Observable<TagEntry>;
    public createTag(newTag?: TagCreate, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<TagEntry>>;
    public createTag(newTag?: TagCreate, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<TagEntry>>;
    public createTag(newTag?: TagCreate, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {


        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected != undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        return this.httpClient.post<TagEntry>(`${this.basePath}/tags`,
            newTag,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Deletes a question.
     * @param id ID of the question to delete
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public deleteQuestion(id: number, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public deleteQuestion(id: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public deleteQuestion(id: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public deleteQuestion(id: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling deleteQuestion.');
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];

        return this.httpClient.delete<any>(`${this.basePath}/questions/${encodeURIComponent(String(id))}`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Deletes a tag. Should also remove it from all files that use it.
     * @param id ID of the tag to delete
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public deleteTag(id: number, observe?: 'body', reportProgress?: boolean): Observable<TagEntry>;
    public deleteTag(id: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<TagEntry>>;
    public deleteTag(id: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<TagEntry>>;
    public deleteTag(id: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling deleteTag.');
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];

        return this.httpClient.delete<TagEntry>(`${this.basePath}/tags/${encodeURIComponent(String(id))}`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Gets the file metadata with the specified id
     * @param id File ID
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getFileById(id: string, observe?: 'body', reportProgress?: boolean): Observable<FileEntry>;
    public getFileById(id: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<FileEntry>>;
    public getFileById(id: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<FileEntry>>;
    public getFileById(id: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling getFileById.');
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];

        return this.httpClient.get<FileEntry>(`${this.basePath}/files/${encodeURIComponent(String(id))}`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Gets the file contents with the specified id
     * @param id File ID
     * @param thumb Whether to return the actual contents or a thumbnail
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getFileContent(id: string, thumb?: boolean, observe?: 'body', reportProgress?: boolean): Observable<string>;
    public getFileContent(id: string, thumb?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<string>>;
    public getFileContent(id: string, thumb?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<string>>;
    public getFileContent(id: string, thumb?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling getFileContent.');
        }


        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (thumb !== undefined && thumb !== null) {
            queryParameters = queryParameters.set('thumb', <any>thumb);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/octet-stream'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];

        return this.httpClient.get<string>(`${this.basePath}/files/contents/${encodeURIComponent(String(id))}`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Lists and queries files
     * @param includeTags Tags to include in this query, referenced by tag ID
     * @param includeOperator Whether includeTags requires all tags to match, or just one
     * @param excludeTags Tags to exclude in this query, referenced by tag ID
     * @param excludeOperator Whether excludeTags requires all tags to match, or just one
     * @param hasBeenTagged Whether to filter to tags that have or have not been tagged
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listFiles(includeTags?: Array<number>, includeOperator?: 'all' | 'any', excludeTags?: Array<number>, excludeOperator?: 'all' | 'any', hasBeenTagged?: boolean, observe?: 'body', reportProgress?: boolean): Observable<Array<FileEntry>>;
    public listFiles(includeTags?: Array<number>, includeOperator?: 'all' | 'any', excludeTags?: Array<number>, excludeOperator?: 'all' | 'any', hasBeenTagged?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<FileEntry>>>;
    public listFiles(includeTags?: Array<number>, includeOperator?: 'all' | 'any', excludeTags?: Array<number>, excludeOperator?: 'all' | 'any', hasBeenTagged?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<FileEntry>>>;
    public listFiles(includeTags?: Array<number>, includeOperator?: 'all' | 'any', excludeTags?: Array<number>, excludeOperator?: 'all' | 'any', hasBeenTagged?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {






        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (includeTags) {
            queryParameters = queryParameters.set('includeTags', includeTags.join(COLLECTION_FORMATS['csv']));
        }
        if (includeOperator !== undefined && includeOperator !== null) {
            queryParameters = queryParameters.set('includeOperator', <any>includeOperator);
        }
        if (excludeTags) {
            queryParameters = queryParameters.set('excludeTags', excludeTags.join(COLLECTION_FORMATS['csv']));
        }
        if (excludeOperator !== undefined && excludeOperator !== null) {
            queryParameters = queryParameters.set('excludeOperator', <any>excludeOperator);
        }
        if (hasBeenTagged !== undefined && hasBeenTagged !== null) {
            queryParameters = queryParameters.set('hasBeenTagged', <any>hasBeenTagged);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];

        return this.httpClient.get<Array<FileEntry>>(`${this.basePath}/files`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Lists questions
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listQuestions(observe?: 'body', reportProgress?: boolean): Observable<Array<QuestionEntry>>;
    public listQuestions(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<QuestionEntry>>>;
    public listQuestions(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<QuestionEntry>>>;
    public listQuestions(observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];

        return this.httpClient.get<Array<QuestionEntry>>(`${this.basePath}/questions`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Lists tags and their metadata
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listTags(observe?: 'body', reportProgress?: boolean): Observable<Array<TagEntry>>;
    public listTags(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<TagEntry>>>;
    public listTags(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<TagEntry>>>;
    public listTags(observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];

        return this.httpClient.get<Array<TagEntry>>(`${this.basePath}/tags`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Modifies the file metadata with the specified id
     * @param id File ID
     * @param patch Patch modifications for the file
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public patchFileById(id: string, patch: FilePatch, observe?: 'body', reportProgress?: boolean): Observable<FileEntry>;
    public patchFileById(id: string, patch: FilePatch, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<FileEntry>>;
    public patchFileById(id: string, patch: FilePatch, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<FileEntry>>;
    public patchFileById(id: string, patch: FilePatch, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling patchFileById.');
        }

        if (patch === null || patch === undefined) {
            throw new Error('Required parameter patch was null or undefined when calling patchFileById.');
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected != undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        return this.httpClient.patch<FileEntry>(`${this.basePath}/files/${encodeURIComponent(String(id))}`,
            patch,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Modifies question metadata
     * @param id ID of the question to modify
     * @param patch Patch modifications for the question
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public patchQuestionByID(id: number, patch: QuestionPatch, observe?: 'body', reportProgress?: boolean): Observable<QuestionEntry>;
    public patchQuestionByID(id: number, patch: QuestionPatch, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<QuestionEntry>>;
    public patchQuestionByID(id: number, patch: QuestionPatch, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<QuestionEntry>>;
    public patchQuestionByID(id: number, patch: QuestionPatch, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling patchQuestionByID.');
        }

        if (patch === null || patch === undefined) {
            throw new Error('Required parameter patch was null or undefined when calling patchQuestionByID.');
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected != undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        return this.httpClient.patch<QuestionEntry>(`${this.basePath}/questions/${encodeURIComponent(String(id))}`,
            patch,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Modifies tag metadata such as description, icon, etc.
     * @param id ID of the tag to modify
     * @param patch Patch modifications for the tag
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public patchTagByID(id: number, patch: TagPatch, observe?: 'body', reportProgress?: boolean): Observable<TagEntry>;
    public patchTagByID(id: number, patch: TagPatch, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<TagEntry>>;
    public patchTagByID(id: number, patch: TagPatch, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<TagEntry>>;
    public patchTagByID(id: number, patch: TagPatch, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling patchTagByID.');
        }

        if (patch === null || patch === undefined) {
            throw new Error('Required parameter patch was null or undefined when calling patchTagByID.');
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'multipart/form-data'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected != undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        return this.httpClient.patch<TagEntry>(`${this.basePath}/tags/${encodeURIComponent(String(id))}`,
            patch,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * Sets the file contents for the specified id
     * @param id File ID
     * @param fileContents The file contents to upload.
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public setFileContent(id: string, fileContents?: Blob, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public setFileContent(id: string, fileContents?: Blob, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public setFileContent(id: string, fileContents?: Blob, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public setFileContent(id: string, fileContents?: Blob, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling setFileContent.');
        }


        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'multipart/form-data'
        ];

        const canConsumeForm = this.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): void | HttpParams; };
        let useForm = false;
        let convertFormParamsToString = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        // see https://stackoverflow.com/questions/4007969/application-x-www-form-urlencoded-or-multipart-form-data
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        }

        if (fileContents !== undefined) {
            formParams = formParams.append('fileContents', <any>fileContents) || formParams;
        }

        return this.httpClient.patch<any>(`${this.basePath}/files/contents/${encodeURIComponent(String(id))}`,
            convertFormParamsToString ? formParams.toString() : formParams,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
