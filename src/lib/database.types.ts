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
          phone: string | null
          department: string | null
          role: string | null
          division: string | null
          position: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          department?: string | null
          role?: string | null
          division?: string | null
          position?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          department?: string | null
          role?: string | null
          division?: string | null
          position?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      corporate_matters: {
        Row: {
          id: string
          matter_number: string
          subject: string | null
          summary: string | null
          type_of_matter: string
          request_form: string
          requester_name: string
          requester_position: string | null
          requesting_division: string | null
          requesting_organization: string | null
          date_requested: string
          date_received: string
          request_type: string
          land_description: string | null
          file_reference: string | null
          title_description: string | null
          title_file_reference: string | null
          survey_plan_no: string | null
          survey_file_reference: string | null
          purchase_documents_reference: string | null
          ilg_name: string | null
          ilg_file_reference: string | null
          zoning: string | null
          lease_type: string | null
          lease_commencement: string | null
          lease_expiry: string | null
          legal_issues: string | null
          claims_allegations: string | null
          applicable_law: string | null
          relevant_stakeholders: string | null
          internal_remarks: string | null
          organisation_responsible: string | null
          priority: string
          confidentiality_level: string
          risk_classification: string | null
          workflow_stage: string
          status: string
          review_status: string | null
          assigned_officer: string | null
          current_reviewer: string | null
          manager_instructions: string | null
          assigned_date: string | null
          due_date: string | null
          sla_days: number
          finalized_at: string | null
          closed_at: string | null
          closed_by: string | null
          closure_notes: string | null
          days_open: number | null
          is_overdue: boolean
          returned_for_revision_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject?: string | null
          summary?: string | null
          type_of_matter: string
          request_form: string
          requester_name: string
          requester_position?: string | null
          requesting_division?: string | null
          requesting_organization?: string | null
          date_requested: string
          date_received: string
          request_type: string
          land_description?: string | null
          file_reference?: string | null
          title_description?: string | null
          title_file_reference?: string | null
          survey_plan_no?: string | null
          survey_file_reference?: string | null
          purchase_documents_reference?: string | null
          ilg_name?: string | null
          ilg_file_reference?: string | null
          zoning?: string | null
          lease_type?: string | null
          lease_commencement?: string | null
          lease_expiry?: string | null
          legal_issues?: string | null
          claims_allegations?: string | null
          applicable_law?: string | null
          relevant_stakeholders?: string | null
          internal_remarks?: string | null
          organisation_responsible?: string | null
          priority?: string
          confidentiality_level?: string
          risk_classification?: string | null
          workflow_stage?: string
          status?: string
          review_status?: string | null
          assigned_officer?: string | null
          current_reviewer?: string | null
          manager_instructions?: string | null
          assigned_date?: string | null
          due_date?: string | null
          sla_days?: number
          finalized_at?: string | null
          closed_at?: string | null
          closed_by?: string | null
          closure_notes?: string | null
          days_open?: number | null
          is_overdue?: boolean
          returned_for_revision_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject?: string | null
          summary?: string | null
          type_of_matter?: string
          request_form?: string
          requester_name?: string
          requester_position?: string | null
          requesting_division?: string | null
          requesting_organization?: string | null
          date_requested?: string
          date_received?: string
          request_type?: string
          land_description?: string | null
          file_reference?: string | null
          title_description?: string | null
          title_file_reference?: string | null
          survey_plan_no?: string | null
          survey_file_reference?: string | null
          purchase_documents_reference?: string | null
          ilg_name?: string | null
          ilg_file_reference?: string | null
          zoning?: string | null
          lease_type?: string | null
          lease_commencement?: string | null
          lease_expiry?: string | null
          legal_issues?: string | null
          claims_allegations?: string | null
          applicable_law?: string | null
          relevant_stakeholders?: string | null
          internal_remarks?: string | null
          organisation_responsible?: string | null
          priority?: string
          confidentiality_level?: string
          risk_classification?: string | null
          workflow_stage?: string
          status?: string
          review_status?: string | null
          assigned_officer?: string | null
          current_reviewer?: string | null
          manager_instructions?: string | null
          assigned_date?: string | null
          due_date?: string | null
          sla_days?: number
          finalized_at?: string | null
          closed_at?: string | null
          closed_by?: string | null
          closure_notes?: string | null
          days_open?: number | null
          is_overdue?: boolean
          returned_for_revision_count?: number
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
          category: string | null
          storage_path: string
          file_size: number | null
          mime_type: string | null
          version: number
          is_draft: boolean
          is_final: boolean
          review_status: string | null
          visibility_level: string
          replaced_by: string | null
          parent_document_id: string | null
          uploaded_by: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          matter_id: string
          title: string
          doc_type?: string | null
          category?: string | null
          storage_path: string
          file_size?: number | null
          mime_type?: string | null
          version?: number
          is_draft?: boolean
          is_final?: boolean
          review_status?: string | null
          visibility_level?: string
          replaced_by?: string | null
          parent_document_id?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          matter_id?: string
          title?: string
          doc_type?: string | null
          category?: string | null
          storage_path?: string
          file_size?: number | null
          mime_type?: string | null
          version?: number
          is_draft?: boolean
          is_final?: boolean
          review_status?: string | null
          visibility_level?: string
          replaced_by?: string | null
          parent_document_id?: string | null
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
          start_date: string | null
          due_date: string | null
          status: string
          priority: string
          dependencies: string | null
          review_required: boolean
          notes: string | null
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
          start_date?: string | null
          due_date?: string | null
          status?: string
          priority?: string
          dependencies?: string | null
          review_required?: boolean
          notes?: string | null
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
          start_date?: string | null
          due_date?: string | null
          status?: string
          priority?: string
          dependencies?: string | null
          review_required?: boolean
          notes?: string | null
          created_at?: string
          completed_at?: string | null
          updated_at?: string
        }
      }
      corporate_matter_assignments: {
        Row: {
          id: string
          matter_id: string
          assigned_to: string | null
          assigned_by: string | null
          assigned_at: string
          instructions: string | null
          due_date: string | null
          is_current: boolean
          reassignment_reason: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          matter_id: string
          assigned_to?: string | null
          assigned_by?: string | null
          assigned_at?: string
          instructions?: string | null
          due_date?: string | null
          is_current?: boolean
          reassignment_reason?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          matter_id?: string
          assigned_to?: string | null
          assigned_by?: string | null
          assigned_at?: string
          instructions?: string | null
          due_date?: string | null
          is_current?: boolean
          reassignment_reason?: string | null
          completed_at?: string | null
        }
      }
      corporate_matter_reviews: {
        Row: {
          id: string
          matter_id: string
          document_id: string | null
          reviewer: string | null
          review_type: string | null
          review_status: string | null
          review_comments: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          matter_id: string
          document_id?: string | null
          reviewer?: string | null
          review_type?: string | null
          review_status?: string | null
          review_comments?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          matter_id?: string
          document_id?: string | null
          reviewer?: string | null
          review_type?: string | null
          review_status?: string | null
          review_comments?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
      corporate_matter_activity_logs: {
        Row: {
          id: string
          matter_id: string
          user_id: string | null
          action_type: string
          action_description: string | null
          old_value: string | null
          new_value: string | null
          field_changed: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          matter_id: string
          user_id?: string | null
          action_type: string
          action_description?: string | null
          old_value?: string | null
          new_value?: string | null
          field_changed?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          matter_id?: string
          user_id?: string | null
          action_type?: string
          action_description?: string | null
          old_value?: string | null
          new_value?: string | null
          field_changed?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      corporate_matter_status_history: {
        Row: {
          id: string
          matter_id: string
          from_status: string | null
          to_status: string | null
          from_workflow_stage: string | null
          to_workflow_stage: string | null
          changed_by: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          matter_id: string
          from_status?: string | null
          to_status?: string | null
          from_workflow_stage?: string | null
          to_workflow_stage?: string | null
          changed_by?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          matter_id?: string
          from_status?: string | null
          to_status?: string | null
          from_workflow_stage?: string | null
          to_workflow_stage?: string | null
          changed_by?: string | null
          reason?: string | null
          created_at?: string
        }
      }
      corporate_matter_notifications: {
        Row: {
          id: string
          matter_id: string
          user_id: string | null
          notification_type: string
          title: string
          message: string | null
          is_read: boolean
          read_at: string | null
          priority: string
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          matter_id: string
          user_id?: string | null
          notification_type: string
          title: string
          message?: string | null
          is_read?: boolean
          read_at?: string | null
          priority?: string
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          matter_id?: string
          user_id?: string | null
          notification_type?: string
          title?: string
          message?: string | null
          is_read?: boolean
          read_at?: string | null
          priority?: string
          action_url?: string | null
          created_at?: string
        }
      }
      corporate_notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          matter_id: string | null
          matter_number: string | null
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          matter_id?: string | null
          matter_number?: string | null
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          matter_id?: string | null
          matter_number?: string | null
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      corporate_matter_closures: {
        Row: {
          id: string
          matter_id: string
          closed_by: string | null
          closure_date: string
          closure_reason: string | null
          final_output_verified: boolean
          archived: boolean
          archived_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          matter_id: string
          closed_by?: string | null
          closure_date?: string
          closure_reason?: string | null
          final_output_verified?: boolean
          archived?: boolean
          archived_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          matter_id?: string
          closed_by?: string | null
          closure_date?: string
          closure_reason?: string | null
          final_output_verified?: boolean
          archived?: boolean
          archived_at?: string | null
          notes?: string | null
        }
      }
      corporate_matter_document_versions: {
        Row: {
          id: string
          document_id: string
          version: number
          storage_path: string
          file_size: number | null
          uploaded_by: string | null
          uploaded_at: string
          change_notes: string | null
        }
        Insert: {
          id?: string
          document_id: string
          version: number
          storage_path: string
          file_size?: number | null
          uploaded_by?: string | null
          uploaded_at?: string
          change_notes?: string | null
        }
        Update: {
          id?: string
          document_id?: string
          version?: number
          storage_path?: string
          file_size?: number | null
          uploaded_by?: string | null
          uploaded_at?: string
          change_notes?: string | null
        }
      }
      corporate_reference_divisions: {
        Row: {
          id: string
          name: string
          code: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      corporate_reference_matter_types: {
        Row: {
          id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      corporate_reference_request_forms: {
        Row: {
          id: string
          name: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_active?: boolean
          created_at?: string
        }
      }
      corporate_reference_request_types: {
        Row: {
          id: string
          name: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_active?: boolean
          created_at?: string
        }
      }
      corporate_reference_document_types: {
        Row: {
          id: string
          name: string
          category: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      corporate_reference_priorities: {
        Row: {
          id: string
          name: string
          level: number
          color_code: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          level: number
          color_code?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          level?: number
          color_code?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      corporate_reference_confidentiality_levels: {
        Row: {
          id: string
          name: string
          level: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          level: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          level?: number
          is_active?: boolean
          created_at?: string
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
