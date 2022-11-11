export * from './default.service';
import { DefaultService } from './default.service';
export * from './files.service';
import { FilesService } from './files.service';
export * from './questions.service';
import { QuestionsService } from './questions.service';
export * from './tags.service';
import { TagsService } from './tags.service';
export const APIS = [DefaultService, FilesService, QuestionsService, TagsService];
