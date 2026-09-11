import { nanoid } from 'nanoid';
import InvariantError from '../../../exceptions/invariant-error.js';
import pool from '../../../api/db.js';

class TicketRepositories {
    constructor() {
        this._pool = pool;
    }

    async addTicket({ title, category, priority, description, reporter_id, issue_image }) {
        const id = `TCK-${nanoid(6).toUpperCase()}`;
        
        const insertQuery = {
            text: `INSERT INTO tickets (ticket_code, title, description, category, priority, reporter_id, issue_image) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            values: [id, title, description, category, priority, reporter_id, issue_image || null]
        }
        const insertResult = await this._pool.query(insertQuery);
        
        if (!insertResult.rows.length) {
            throw new InvariantError('Gagal membuat tiket laporan IT baru');
        }

        const newTicketId = insertResult.rows[0].id;

        const getQuery = {
            text: `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name,
                    a.specialization AS assignee_specialization
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE t.id = $1
            `,
            values: [newTicketId]
        }
        const getResult = await this._pool.query(getQuery);
        
        return getResult.rows[0];
    }

    // Fungsi Baru: Menarik data berdasarkan departemen pelapor
    async getTicketsByDepartment(department) {
        const query = {
            text: `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name,
                    a.specialization AS assignee_specialization
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id 
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE r.department = $1 
                ORDER BY t.created_at DESC
            `,
            values: [department]
        }
        const result = await this._pool.query(query);
        return result.rows;
    }

    async getTicketById(id) {
        const query = {
            text: `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name,
                    a.specialization AS assignee_specialization
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE t.id = $1
            `,
            values: [id]
        }
        const result = await this._pool.query(query);
        return result.rows[0];
    }

    // Modifikasi: Menambahkan pengurutan berdasarkan Prioritas lalu Waktu
    async getAllTicket() {
        const query = {
            text: `
                SELECT 
                    t.*, 
                    t.in_progress_at,
                    t.resolved_at,
                    t.closed_at,
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name,
                    a.specialization AS assignee_specialization
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id
                LEFT JOIN users a ON t.assignee_id = a.id
                ORDER BY 
                    CASE 
                        WHEN t.status IN ('OPEN', 'IN_PROGRESS', 'RE-OPENED') AND t.priority = 'HIGH' THEN 1
                        WHEN t.status IN ('OPEN', 'IN_PROGRESS', 'RE-OPENED') AND t.priority = 'MEDIUM' THEN 2
                        WHEN t.status IN ('OPEN', 'IN_PROGRESS', 'RE-OPENED') AND t.priority = 'LOW' THEN 3
                        ELSE 4
                    END,
                    t.created_at DESC
            `,
        }
        const result = await this._pool.query(query)
        return result.rows;
    }

    async updateTicketStatus(id, status, assignee_id, resolution_notes=null, resolution_image=null) {
        let updateQueryText = `
            UPDATE tickets 
            SET status = $1, 
                assignee_id = $2, 
                resolution_notes = COALESCE($3, resolution_notes), 
                resolution_image = COALESCE($4, resolution_image), 
                updated_at = CURRENT_TIMESTAMP`;

        if (status === 'IN_PROGRESS') {
            updateQueryText += `, in_progress_at = COALESCE(in_progress_at, CURRENT_TIMESTAMP)`;
        } else if (status === 'RESOLVED') {
            updateQueryText += `, resolved_at = CURRENT_TIMESTAMP`;
        }

        updateQueryText += ` WHERE id = $5 RETURNING id`;

        const updateQuery = {
            text: updateQueryText,
            values: [status, assignee_id, resolution_notes, resolution_image, id]
        }
        const updateResult = await this._pool.query(updateQuery);
        
        if (!updateResult.rows.length) {
            throw new InvariantError('ticket tidak ditemukan');
        }

        const getQuery = {
            text: `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name,
                    a.specialization AS assignee_specialization
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE t.id = $1
            `,
            values: [id]
        }
        const getResult = await this._pool.query(getQuery);
        
        return getResult.rows[0]; 
    }

    async assignTicket(id, assignee_id, assigner_id, assignment_note) {
        let updateQueryText = `
            UPDATE tickets 
            SET assignee_id = $2, 
                assigner_id = $3,
                assignment_note = $4,
                status = 'IN_PROGRESS',
                in_progress_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP`;
        
        updateQueryText += ` WHERE id = $1 RETURNING id`;

        const updateQuery = {
            text: updateQueryText,
            values: [id, assignee_id, assigner_id, assignment_note]
        }
        const updateResult = await this._pool.query(updateQuery);
        
        if (!updateResult.rows.length) {
            throw new InvariantError('ticket tidak ditemukan');
        }

        const getQuery = {
            text: `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name,
                    a.specialization AS assignee_specialization
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE t.id = $1
            `,
            values: [id]
        }
        const getResult = await this._pool.query(getQuery);
        
        return getResult.rows[0]; 
    }

    async deleteTicket(id) {
        const isNumeric = !isNaN(id) && !isNaN(parseInt(id));
        const query = {
            text: isNumeric 
                ? `DELETE FROM tickets WHERE id = $1 RETURNING id` 
                : `DELETE FROM tickets WHERE ticket_code = $1 RETURNING id`,
            values: [id]
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Gagal menghapus tiket, tiket tidak ditemukan');
        }
        return result.rows[0].id;
    }

    async updateTicketFeedback(id, rating, feedback_note, status) {
        let updateQueryText = `
            UPDATE tickets 
            SET status = $1, 
                rating = $2, 
                feedback_note = $3, 
                updated_at = CURRENT_TIMESTAMP
        `;
        
        if (status === 'CLOSED') {
            updateQueryText += `, closed_at = CURRENT_TIMESTAMP`;
        } else if (status === 'RE-OPENED') {
            updateQueryText += `, reopened_at = CURRENT_TIMESTAMP`;
        }
        
        updateQueryText += ` WHERE id = $4 RETURNING id`;

        const updateQuery = {
            text: updateQueryText,
            values: [status, rating, feedback_note, id]
        }
        const updateResult = await this._pool.query(updateQuery);
        
        if (!updateResult.rows.length) {
            throw new InvariantError('ticket tidak ditemukan');
        }

        const getQuery = {
            text: `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name,
                    a.specialization AS assignee_specialization
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE t.id = $1
            `,
            values: [id]
        }
        const getResult = await this._pool.query(getQuery);
        
        return getResult.rows[0]; 
    }

    async getTicketsByUserRole(userId, role) {
        let queryText = '';
        if (role === 'EMPLOYEE') {
            queryText = `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name,
                    a.specialization AS assignee_specialization
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE t.reporter_id = $1
                ORDER BY t.created_at DESC
            `;
        } else if (role === 'SUPERADMIN' || role === 'ADMIN') {
            queryText = `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name,
                    a.specialization AS assignee_specialization
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE t.assigner_id = $1
                ORDER BY t.created_at DESC
            `;
        } else {
            // For IT_STAFF or ADMIN
            queryText = `
                SELECT 
                    t.*, 
                    r.full_name AS reporter_name,
                    r.department AS reporter_department,
                    a.full_name AS assignee_name,
                    a.specialization AS assignee_specialization
                FROM tickets t
                JOIN users r ON t.reporter_id = r.id
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE t.assignee_id = $1
                ORDER BY t.created_at DESC
            `;
        }

        const query = {
            text: queryText,
            values: [userId]
        };
        const result = await this._pool.query(query);
        return result.rows;
    }
}

export default new TicketRepositories();