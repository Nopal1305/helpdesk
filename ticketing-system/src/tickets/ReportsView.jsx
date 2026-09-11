import { useMemo, useState } from 'react';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function ReportsView({ tickets }) {
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // Extract unique months (YYYY-MM format) from tickets for the dropdown
  const availableMonths = useMemo(() => {
    const months = new Set();
    tickets.forEach(t => {
      if (t.createdAt) {
        const d = new Date(t.createdAt);
        // Format as YYYY-MM
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthKey);
      }
    });
    // Sort descending (newest first)
    return Array.from(months).sort().reverse();
  }, [tickets]);

  // Filter tickets by selected month
  const filteredTickets = useMemo(() => {
    if (selectedMonth === 'ALL') return tickets;
    return tickets.filter(t => {
      if (!t.createdAt) return false;
      const d = new Date(t.createdAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth;
    });
  }, [tickets, selectedMonth]);

  const stats = useMemo(() => {
    return {
      total: filteredTickets.length,
      open: filteredTickets.filter(t => t.status === 'OPEN').length,
      inProgress: filteredTickets.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: filteredTickets.filter(t => t.status === 'RESOLVED').length,
    };
  }, [filteredTickets]);

  const formatMonthLabel = (yyyyMm) => {
    const [year, month] = yyyyMm.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tickets');

    const headers = ['Ticket ID', 'Title', 'Category', 'Department', 'Reporter', 'Assignee', 'Priority', 'Status', 'Created At', 'Resolved At'];
    worksheet.addRow(headers);

    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' } // slate-200
      };
    });

    // Add data and borders
    filteredTickets.forEach(t => {
      const row = worksheet.addRow([
        t.code || t.id,
        t.title || '',
        t.category || t.department || 'Other',
        t.reporterDept,
        t.reporter,
        t.assignee || 'Unassigned',
        t.priority,
        t.status,
        t.createdAt ? new Date(t.createdAt).toLocaleString('en-US') : '-',
        t.resolvedAt ? new Date(t.resolvedAt).toLocaleString('en-US') : '-'
      ]);

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Auto-size columns slightly
    worksheet.getColumn(1).width = 15; // Ticket ID
    worksheet.getColumn(2).width = 35; // Title
    worksheet.getColumn(3).width = 20; // Category
    worksheet.getColumn(4).width = 20; // Department
    worksheet.getColumn(5).width = 25; // Reporter
    worksheet.getColumn(6).width = 25; // Assignee
    worksheet.getColumn(7).width = 15; // Priority
    worksheet.getColumn(8).width = 15; // Status
    worksheet.getColumn(9).width = 25; // Created At
    worksheet.getColumn(10).width = 25; // Resolved At

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `ticket_report_${selectedMonth === 'ALL' ? 'all_months' : selectedMonth}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, filename);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
          <p className="text-sm text-slate-500">Ticket statistics summary and data recap.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="ALL">All Months</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{formatMonthLabel(month)}</option>
            ))}
          </select>
          <button
            onClick={downloadExcel}
            className="flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 w-full sm:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export to Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Tickets</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-100 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Open</p>
          <p className="mt-2 text-3xl font-bold text-blue-800">{stats.open}</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">{stats.inProgress}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Resolved</p>
          <p className="mt-2 text-3xl font-bold text-green-700">{stats.resolved}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-800">
            {selectedMonth === 'ALL' ? 'All Tickets' : `Tickets for ${formatMonthLabel(selectedMonth)}`}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">Title</th>
                <th className="px-6 py-3 font-semibold">Dept</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Priority</th>
                <th className="px-6 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{ticket.code || ticket.id}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{ticket.title}</td>
                  <td className="px-6 py-4 text-xs font-medium">{ticket.reporterDept}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${
                      ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-orange-50 text-orange-600' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium">{ticket.priority}</span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-US') : '-'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No ticket data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
