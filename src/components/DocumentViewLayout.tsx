import React from 'react';
import {
  FileCheck2,
  Printer,
  FileDown,
  XCircle,
  Save,
  CheckCircle2,
  Building2,
  Store,
  Calendar,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { StatusBadge, UnifiedStatus } from './ui/StatusBadge';
import { CurrencyDisplay } from './ui/CurrencyDisplay';
import { DateDisplay } from './ui/DateDisplay';
import { BreadcrumbItem, Breadcrumbs } from './ui/Breadcrumbs';

export interface DocumentHeaderProps {
  documentType: string;
  documentNumber: string;
  status: UnifiedStatus | string;
  date: string;
  warehouseName?: string;
  partnerName?: string;
  partnerLabel?: string; // e.g. "Dobavljač" or "Kupac"
  notes?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export interface DocumentTotalItem {
  label: string;
  value: number | string;
  isCurrency?: boolean;
  isBold?: boolean;
}

interface DocumentViewLayoutProps {
  header: DocumentHeaderProps;
  children: React.ReactNode;
  totals: DocumentTotalItem[];
  onBack?: () => void;
  onSaveDraft?: () => void;
  onPost?: () => void;
  onCancelDoc?: () => void;
  onPrint?: () => void;
  onExportPdf?: () => void;
  canEdit?: boolean;
  className?: string;
}

export const DocumentViewLayout: React.FC<DocumentViewLayoutProps> = ({
  header,
  children,
  totals,
  onBack,
  onSaveDraft,
  onPost,
  onCancelDoc,
  onPrint,
  onExportPdf,
  canEdit = true,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <div>
          {header.breadcrumbs && <Breadcrumbs items={header.breadcrumbs} onHomeClick={onBack} />}
          <div className="flex items-center gap-3 mt-1">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 transition-colors"
                title="Nazad"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {header.documentType}
              </span>
              <h1 className="text-xl font-bold font-mono text-slate-900 leading-tight">
                {header.documentNumber}
              </h1>
            </div>
            <StatusBadge status={header.status} size="md" />
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {onExportPdf && (
            <button
              type="button"
              onClick={onExportPdf}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5 text-slate-500" />
              <span>PDF</span>
            </button>
          )}

          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Štampaj</span>
            </button>
          )}

          {onCancelDoc && header.status !== 'OTKAZANO' && header.status !== 'CANCELLED' && (
            <button
              type="button"
              onClick={onCancelDoc}
              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Otkaži</span>
            </button>
          )}

          {onSaveDraft && canEdit && (
            <button
              type="button"
              onClick={onSaveDraft}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Sačuvaj nacrt</span>
            </button>
          )}

          {onPost && header.status !== 'KNJIŽENO' && header.status !== 'POSTED' && (
            <button
              type="button"
              onClick={onPost}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Knjiži dokument</span>
            </button>
          )}
        </div>
      </div>

      {/* Meta Header Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Datum dokumenta:</span>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <DateDisplay date={header.date} />
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Skladište / Objekat:</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <Store className="h-3.5 w-3.5 text-slate-400" />
              <span>{header.warehouseName || 'Centralni magacin'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">
              {header.partnerLabel || 'Poslovni partner'}:
            </span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              <span>{header.partnerName || 'Interno / Krajnji kupac'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Napomena:</span>
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{header.notes || 'Nema posebnih napomena'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Lines (Table or List) */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Stavke dokumenta
          </span>
          <span className="text-[11px] text-slate-400 font-mono">ERP Table Lines</span>
        </div>
        <div>{children}</div>
      </div>

      {/* Totals Footer Bar */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-6 text-xs">
          {totals.map((tot, idx) => (
            <div
              key={idx}
              className={`flex sm:flex-col justify-between sm:justify-center items-baseline sm:items-end ${
                tot.isBold ? 'pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-6 border-slate-200' : ''
              }`}
            >
              <span className="text-slate-500 text-[11px] font-medium sm:mb-0.5">{tot.label}</span>
              <div
                className={`font-mono text-slate-900 ${
                  tot.isBold ? 'text-base sm:text-lg font-bold text-emerald-800' : 'font-semibold'
                }`}
              >
                {tot.isCurrency ? <CurrencyDisplay amount={tot.value} bold={tot.isBold} /> : tot.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
