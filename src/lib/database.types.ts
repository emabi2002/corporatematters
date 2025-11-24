export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string | null
          division: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string | null
          division?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string | null
          division?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      corporate_matters: {
        Row: {
          id: string
          matter_number: string
          type_of_matter: string
          request_form: string
          requester_name: string
          requester_position: string | null
          requesting_division: string | null
          date_requested: string
          date_received: string
          request_type: string
          land_description: string | null
          zoning: string | null
          survey_plan_no: string | null
          lease_type: string | null
          lease_commencement: string | null
          lease_expiry: string | null
          legal_issues: string | null
          organisation_responsible: string | null
          assigned_officer: string | null
          assigned_date: string | null
          status: string
          due_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type_of_matter: string
          request_form: string
          requester_name: string
          requester_position?: string | null
          requesting_division?: string | null
          date_requested: string
          date_received: string
          request_type: string
          land_description?: string | null
          zoning?: string | null
          survey_plan_no?: string | null
          lease_type?: string | null
          lease_commencement?: string | null
          lease_expiry?: string | null
          legal_issues?: string | null
          organisation_responsible?: string | null
          assigned_officer?: string | null
          assigned_date?: string | null
          status?: string
          due_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type_of_matter?: string
          request_form?: string
          requester_name?: string
          requester_position?: string | null
          requesting_division?: string | null
          date_requested?: string
          date_received?: string
          request_type?: string
          land_description?: string | null
          zoning?: string | null
          survey_plan_no?: string | null
          lease_type?: string | null
          lease_commencement?: string | null
          lease_expiry?: string | null
          legal_issues?: string | null
          organisation_responsible?: string | null
          assigned_officer?: string | null
          assigned_date?: string | null
          status?: string
          due_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      corporate_matter_documents: {
        Row: {
          id: string
          matter_id: string
          title: string
          doc_type: string | null
          storage_path: string
          file_size: number | null
          mime_type: string | null
          uploaded_by: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          matter_id: string
          title: string
          doc_type?: string | null
          storage_path: string
          file_size?: number | null
          mime_type?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          matter_id?: string
          title?: string
          doc_type?: string | null
          storage_path?: string
          file_size?: number | null
          mime_type?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
        }
      }
      corporate_matter_tasks: {
        Row: {
          id: string
          matter_id: string
          task_type: string | null
          description: string
          assigned_officer: string | null
          due_date: string | null
          status: string
          created_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          matter_id: string
          task_type?: string | null
          description: string
          assigned_officer?: string | null
          due_date?: string | null
          status?: string
          created_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          matter_id?: string
          task_type?: string | null
          description?: string
          assigned_officer?: string | null
          due_date?: string | null
          status?: string
          created_at?: string
          completed_at?: string | null
          updated_at?: string
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
