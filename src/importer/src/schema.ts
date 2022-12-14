export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      files: {
        Row: {
          storageID: string
          md5sum: string
          hasBeenTagged: boolean
          id: number
        }
        Insert: {
          storageID: string
          md5sum?: string
          hasBeenTagged?: boolean
          id?: number
        }
        Update: {
          storageID?: string
          md5sum?: string
          hasBeenTagged?: boolean
          id?: number
        }
      }
      filetags: {
        Row: {
          id: number
          fileid: number
          tagid: number
        }
        Insert: {
          id?: number
          fileid: number
          tagid: number
        }
        Update: {
          id?: number
          fileid?: number
          tagid?: number
        }
      }
      questionoptions: {
        Row: {
          id: number
          tagid: number | null
          questionid: number | null
          optiontext: string | null
        }
        Insert: {
          id?: number
          tagid?: number | null
          questionid?: number | null
          optiontext?: string | null
        }
        Update: {
          id?: number
          tagid?: number | null
          questionid?: number | null
          optiontext?: string | null
        }
      }
      questions: {
        Row: {
          id: number
          orderingID: number
          questionText: string
          mutuallyExclusive: boolean
        }
        Insert: {
          id?: number
          orderingID?: number
          questionText?: string
          mutuallyExclusive?: boolean
        }
        Update: {
          id?: number
          orderingID?: number
          questionText?: string
          mutuallyExclusive?: boolean
        }
      }
      tags: {
        Row: {
          id: number
          created_at: string | null
          name: string
          description: string
        }
        Insert: {
          id?: number
          created_at?: string | null
          name?: string
          description?: string
        }
        Update: {
          id?: number
          created_at?: string | null
          name?: string
          description?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

