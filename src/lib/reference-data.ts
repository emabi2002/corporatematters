'use client';

// ============================================================================
// Centralized Reference / Master Data loader
// ----------------------------------------------------------------------------
// All dropdown / picklist values shown in the UI are sourced LIVE from the
// Supabase reference tables (managed under Admin > Reference Data). The legacy
// constant arrays are kept ONLY as an emergency fallback so a form never renders
// an empty dropdown if a table is momentarily unreachable or has not been
// created yet. In normal operation every value below comes from the database.
// ============================================================================

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import {
  MATTER_TYPES,
  REQUEST_FORMS,
  REQUEST_TYPES,
  DOCUMENT_TYPES,
  LEASE_TYPES,
  RISK_CLASSIFICATIONS,
  TASK_TYPES,
  DIVISIONS,
} from '@/lib/constants';
import { PRIORITY_LIST, CONFIDENTIALITY_LEVEL_LIST } from '@/lib/workflow-constants';

export interface ReferenceData {
  matterTypes: string[];
  requestForms: string[];
  requestTypes: string[];
  documentTypes: string[];
  priorities: string[];
  confidentialityLevels: string[];
  divisions: string[];
  leaseTypes: string[];
  riskClassifications: string[];
  taskTypes: string[];
}

// Emergency fallback (never used while the tables are populated).
const FALLBACK: ReferenceData = {
  matterTypes: [...MATTER_TYPES],
  requestForms: [...REQUEST_FORMS],
  requestTypes: [...REQUEST_TYPES],
  documentTypes: [...DOCUMENT_TYPES],
  priorities: [...PRIORITY_LIST],
  confidentialityLevels: [...CONFIDENTIALITY_LEVEL_LIST],
  divisions: [...DIVISIONS],
  leaseTypes: [...LEASE_TYPES],
  riskClassifications: [...RISK_CLASSIFICATIONS],
  taskTypes: [...TASK_TYPES],
};

/**
 * Fetch the active `name` values from a reference table.
 * Returns `null` (so the caller can fall back) if the table is missing,
 * unreachable, or has no active rows.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchNames(sb: any, table: string, orderBy = 'name'): Promise<string[] | null> {
  try {
    const { data, error } = await sb
      .from(table)
      .select('name')
      .eq('is_active', true)
      .order(orderBy, { ascending: true });

    if (error || !data) return null;
    const names = (data as { name: string }[])
      .map((r) => r.name)
      .filter((n): n is string => Boolean(n));
    return names.length > 0 ? names : null;
  } catch {
    return null;
  }
}

/**
 * Load every reference list directly from the database (one round-trip per
 * table, all in parallel). Falls back to the legacy constant for any table
 * that is unavailable.
 */
export async function fetchReferenceData(): Promise<ReferenceData> {
  const sb = createClient();
  const [
    matterTypes,
    requestForms,
    requestTypes,
    documentTypes,
    priorities,
    confidentialityLevels,
    divisions,
    leaseTypes,
    riskClassifications,
    taskTypes,
  ] = await Promise.all([
    fetchNames(sb, 'corporate_reference_matter_types'),
    fetchNames(sb, 'corporate_reference_request_forms'),
    fetchNames(sb, 'corporate_reference_request_types'),
    fetchNames(sb, 'corporate_reference_document_types'),
    fetchNames(sb, 'corporate_reference_priorities', 'level'),
    fetchNames(sb, 'corporate_reference_confidentiality_levels', 'level'),
    fetchNames(sb, 'corporate_reference_divisions'),
    fetchNames(sb, 'corporate_reference_lease_types'),
    fetchNames(sb, 'corporate_reference_risk_classifications'),
    fetchNames(sb, 'corporate_reference_task_types'),
  ]);

  return {
    matterTypes: matterTypes ?? FALLBACK.matterTypes,
    requestForms: requestForms ?? FALLBACK.requestForms,
    requestTypes: requestTypes ?? FALLBACK.requestTypes,
    documentTypes: documentTypes ?? FALLBACK.documentTypes,
    priorities: priorities ?? FALLBACK.priorities,
    confidentialityLevels: confidentialityLevels ?? FALLBACK.confidentialityLevels,
    divisions: divisions ?? FALLBACK.divisions,
    leaseTypes: leaseTypes ?? FALLBACK.leaseTypes,
    riskClassifications: riskClassifications ?? FALLBACK.riskClassifications,
    taskTypes: taskTypes ?? FALLBACK.taskTypes,
  };
}

/**
 * React hook: returns every reference list (live from the database) plus a
 * `loading` flag. Use the returned arrays to populate <Select> dropdowns.
 */
export function useReferenceData(): ReferenceData & { loading: boolean } {
  const [data, setData] = useState<ReferenceData>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchReferenceData().then((result) => {
      if (!active) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { ...data, loading };
}
