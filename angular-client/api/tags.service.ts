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

import { TagCreate } from '../model/tagCreate';
import { TagEntry } from '../model/tagEntry';
import { TagPatch } from '../model/tagPatch';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


@Injectable()
export class TagsService {

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

}
